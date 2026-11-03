import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MessageSquare,
  Vote,
  Send,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, ChatMessage } from '../../types/multiplayer';
import {
  setOnlineRoomPhase,
  sendOnlineChatMessage,
  sendOnlineVoiceMessage,
  subscribeToChatMessages,
} from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineDiscussionScreenProps {
  room: OnlineRoomData;
  currentPlayer: OnlinePlayer;
  players: OnlinePlayer[];
  lang: Language;
  theme: Theme;
}

export const OnlineDiscussionScreen: React.FC<OnlineDiscussionScreenProps> = ({
  room,
  currentPlayer,
  players,
  lang,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [showCluesList, setShowCluesList] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Requirement 9 & 3: Real live voice broadcast and reception
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<{ name: string; avatar: string } | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const playedVoiceIdsRef = useRef<Set<string>>(new Set());
  const currentAudioElemRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play voice messages from other players in real time
  const playVoiceClip = (msgId: string, audioData: string, senderName: string, senderAvatar: string) => {
    try {
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
        currentAudioElemRef.current = null;
      }

      const audio = new Audio(audioData);
      audio.volume = 1.0;
      currentAudioElemRef.current = audio;
      setCurrentlySpeaking({ name: senderName, avatar: senderAvatar });
      setActivePlayingId(msgId);

      audio.onended = () => {
        setCurrentlySpeaking(null);
        setActivePlayingId(null);
        currentAudioElemRef.current = null;
      };

      audio.onerror = () => {
        setCurrentlySpeaking(null);
        setActivePlayingId(null);
        currentAudioElemRef.current = null;
      };

      audio.play().catch((err) => {
        console.warn('Audio play request blocked or interrupted:', err);
        setCurrentlySpeaking(null);
        setActivePlayingId(null);
      });
    } catch (err) {
      console.warn('Error playing voice clip:', err);
    }
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      setIsMicActive(true);
      sound.playClick();

      // Realtime decibel analyzer for volume meter
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!mediaStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }

      // Set up MediaRecorder to capture and broadcast audio slices to the room
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        '',
      ];
      const selectedMime = mimeTypes.find((m) => !m || MediaRecorder.isTypeSupported(m)) || '';

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime, audioBitsPerSecond: 24000 })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 200) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            if (base64Audio && base64Audio.length > 50) {
              await sendOnlineVoiceMessage(room.roomCode, currentPlayer, base64Audio, 2500);
            }
          };
          reader.readAsDataURL(e.data);
        }
      };

      // Slice audio in 2.5 second bursts so other players hear speech progressively without delay
      recorder.start(2500);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      setIsMicActive(false);
    }
  };

  const stopMicrophone = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        // Ignored
      }
      mediaRecorderRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setMicVolume(0);
    sound.playClick();
  };

  // Cleanup mic and playing audio on unmount or phase change
  useEffect(() => {
    return () => {
      stopMicrophone();
      if (currentAudioElemRef.current) {
        currentAudioElemRef.current.pause();
        currentAudioElemRef.current = null;
      }
    };
  }, []);

  const toggleMicrophone = () => {
    if (isMicActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  // Synchronized Discussion Timer
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return room.settings.discussionTimer || 90;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  // Subscribe to real-time chat with automatic incoming voice playback
  useEffect(() => {
    const unsub = subscribeToChatMessages(room.roomCode, (messages) => {
      setChatMessages(messages);

      // Check for incoming voice messages from other players to auto-play out loud!
      const now = Date.now();
      messages.forEach((msg) => {
        if (msg.isVoice && msg.audioData && msg.senderId !== currentPlayer.id) {
          if (!playedVoiceIdsRef.current.has(msg.id)) {
            playedVoiceIdsRef.current.add(msg.id);
            // Only auto-play if fresh (recorded within last 12 seconds)
            if (now - msg.timestamp < 12000) {
              playVoiceClip(msg.id, msg.audioData, msg.senderName, msg.senderAvatar);
            }
          }
        }
      });
    });
    return () => unsub();
  }, [room.roomCode, currentPlayer.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [autoAdvancing, setAutoAdvancing] = useState<boolean>(false);

  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If timer hits 0: automatically transition to voting
      if (remaining === 0 && !autoAdvancing) {
        setAutoAdvancing(true);
        clearInterval(interval);
        handleStartVoting();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, autoAdvancing]);

  const handleStartVoting = async () => {
    sound.playClick();
    const votingTime = room.settings.votingTimer || 30;
    await setOnlineRoomPhase(room.roomCode, 'VOTING', votingTime);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText('');
    sound.playClick();
    await sendOnlineChatMessage(room.roomCode, currentPlayer, msg);
  };

  const handleSendQuickPhrase = async (phrase: string) => {
    sound.playClick();
    await sendOnlineChatMessage(room.roomCode, currentPlayer, phrase);
  };

  const quickPhrases = isEn
    ? [
        'You are the imposter! 🕵️',
        'I am 100% innocent citizen! 🛡️',
        'That clue is super suspicious! 🤔',
        'Why are you looking at me?! 👀',
        'Guaranteed imposter caught! 🫵',
        'Why so quiet? Confess! 🤐',
        'I swear I am an innocent baby! 🍼',
        'Imposter is trembling now! 😂',
        'Don\'t vote me, you will regret! 🛑',
        'Lying is a bad sin! 🤫',
        'Caught red handed! 💀',
        'Talk less, act smart! 🏃‍♂️',
        'Something is cooking here! 🍲',
        'Facts right there! 💯',
      ]
    : [
        'ভাইরে ভাই ধাপ্পাবাজ কে?! 🤯',
        'আমার দিকে তাকাচ্ছেন কেন?! 👀',
        '১০০% শিওর এইটাই চোর! 🫵',
        'বিশ্বাস করেন আমি নিষ্পাপ পাবলিক 😇',
        'ক্লুটা তো পুরাই সন্দেহজনক! 🤔',
        'আরে ধুর, আমি একদম নির্দোষ! 🛡️',
        'ধাপ্পাবাজের হাত-পা কাঁপতেছে! 😂',
        'মিথ্যা কথা বলা মহাপাপ ভাই 🤫',
        'আমাকে ভোট দিলে পরে আফসোস করবেন! 🛑',
        'ধরা খাইলে কিন্তু খবর আছে! 💀',
        'চোর পালালে বুদ্ধি বাড়ে 🏃‍♂️',
        'কথা কম, কাজ বেশি! 🤐',
        'ডাল মে কুচ কালা হ্যায়! 🍲',
        'একদম খাঁটি কথা 💯',
      ];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 max-w-3xl mx-auto transition-colors duration-200">
      {/* Synchronized Timer Bar */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Live Discussion & Chat' : 'সরাসরি আলোচনা ও চ্যাট'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Interrogate suspects before voting' : 'ভোটের পূর্বে সবাইকে জেরা করুন'}
            </p>
          </div>
        </div>

        {/* Countdown Pill */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono text-lg sm:text-xl font-black border transition-all ${
            timeLeft <= 10
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Clues Review Collapsible Tray */}
      <div className="my-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs">
        <button
          type="button"
          onClick={() => setShowCluesList(!showCluesList)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1 py-0.5 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Submitted Clues for Reference' : 'খেলোয়াড়দের দেওয়া ক্লুসমূহ'}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{showCluesList ? (isEn ? 'Hide' : 'লুকান') : (isEn ? 'Show' : 'দেখুন')}</span>
            {showCluesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showCluesList && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[22vh] overflow-y-auto pt-1 border-t border-slate-100 dark:border-slate-800">
            {players.map((p) => {
              const isMe = p.id === currentPlayer.id;
                const isSpeaking = currentlySpeaking?.name === p.name || (isMe && isMicActive);
                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      isSpeaking
                        ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-400/60 shadow-md animate-pulse'
                        : isMe
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1 min-w-0 font-semibold truncate">
                        <span>{p.avatar || '🕵️'}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      {isSpeaking && (
                        <span className="text-[10px] text-emerald-500 font-bold shrink-0">
                          🎙️
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
                      "{p.clue || (isEn ? 'No clue' : 'ক্লু নেই')}"
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Real-time In-Game Chat Box */}
      <div className="my-1 flex-1 flex flex-col min-h-[35vh] max-h-[46vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs overflow-hidden">
        {/* Live Speaking Broadcaster Banner */}
        {currentlySpeaking && (
          <div className="mb-2 p-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{currentlySpeaking.avatar}</span>
              <span className="truncate">🎙️ {currentlySpeaking.name} {isEn ? 'is speaking live...' : 'কথা বলছেন (শব্দ শুনছেন)...'}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-1">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
              <span>{isEn ? 'No messages yet. Break the silence!' : 'এখনও কোনো বার্তা নেই। আলোচনা শুরু করুন!'}</span>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.senderId === currentPlayer.id;
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0 mb-1">
                      {msg.senderAvatar || '🕵️'}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 rounded-br-xs font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                        {msg.senderName}
                      </div>
                    )}

                    {msg.isVoice ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (activePlayingId === msg.id && currentAudioElemRef.current) {
                                currentAudioElemRef.current.pause();
                                currentAudioElemRef.current = null;
                                setActivePlayingId(null);
                                setCurrentlySpeaking(null);
                              } else if (msg.audioData) {
                                playVoiceClip(msg.id, msg.audioData, msg.senderName, msg.senderAvatar);
                              }
                            }}
                            className={`p-1.5 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                              activePlayingId === msg.id
                                ? 'bg-slate-900 text-amber-400'
                                : isMe
                                ? 'bg-slate-950/20 text-slate-950 hover:bg-slate-950/30'
                                : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {activePlayingId === msg.id ? (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="flex items-center gap-1 font-bold text-xs">
                            <span>🎙️ {isEn ? 'Voice Talk' : 'ভয়েস বার্তা'}</span>
                            {activePlayingId === msg.id && (
                              <span className="flex items-center gap-0.5 ml-1">
                                <span className="w-1 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-3.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-2 bg-current rounded-full animate-bounce" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="leading-relaxed break-words">{msg.text}</div>
                    )}

                    <div
                      className={`text-[9px] text-right mt-1 ${
                        isMe ? 'text-amber-900/70' : 'text-slate-400'
                      }`}
                    >
                      {timeStr}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reaction Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 shrink-0">
          {quickPhrases.map((phrase, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSendQuickPhrase(phrase)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300 text-slate-600 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Live Microphone Voice Indicator (Ephemeral, Zero storage) */}
        {isMicActive && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{isEn ? 'Microphone Active (Speaking live...)' : '🎙️ মাইক্রোফোন চালু (সরাসরি কথা বলুন...)'}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Volume2 className="w-3.5 h-3.5" />
              <span>{micVolume}%</span>
            </div>
          </div>
        )}

        {/* Message Input Form with Microphone Toggle */}
        <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0 pt-1">
          {/* Microphone Talk Button */}
          <button
            type="button"
            onClick={toggleMicrophone}
            title={isMicActive ? (isEn ? 'Mute Microphone' : 'মাইক বন্ধ করুন') : (isEn ? 'Speak using Microphone' : 'মাইক্রোফোনে কথা বলুন')}
            className={`px-3 py-2.5 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
              isMicActive
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            {isMicActive ? <Mic className="w-4 h-4 text-slate-950" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={140}
            placeholder={isEn ? 'Type a message in discussion...' : 'সবার সাথে আলোচনা করতে লিখুন...'}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'Send' : 'পাঠান'}</span>
          </button>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartVoting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Vote className="w-5 h-5" />
            <span>{isEn ? 'End Discussion & Start Voting' : 'আলোচনা শেষ করে ভোট শুরু করুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-1">
            {isEn
              ? 'Discuss clues. Voting begins when timer ends or host advances.'
              : 'ক্লু নিয়ে আলোচনা করুন। সময় শেষ হলে বা হোস্ট ক্লিক করলে ভোট শুরু হবে।'}
          </div>
        )}
      </div>
    </div>
  );
};
