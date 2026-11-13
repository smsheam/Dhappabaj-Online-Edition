import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  MessageSquare,
  Vote,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Smile,
  Timer,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, ChatMessage } from '../../types/multiplayer';
import {
  setOnlineRoomPhase,
  sendOnlineChatMessage,
  subscribeToChatMessages,
  CHAT_COOLDOWN_MS,
} from '../../services/multiplayerService';
import { getCustomQuickChats } from '../../services/adminService';
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

  // Optimized: Last 3 messages only
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showCluesList, setShowCluesList] = useState<boolean>(true);
  const [quickCategory, setQuickCategory] = useState<'suspect' | 'defense' | 'fun'>('suspect');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized Discussion Timer
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return room.settings.discussionTimer || 90;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  // Subscribe to real-time chat with strict limit(3) from Firestore
  useEffect(() => {
    const unsub = subscribeToChatMessages(room.roomCode, (messages) => {
      // Keep strictly the latest 3 messages
      setChatMessages(messages.slice(-3));
    });
    return () => unsub();
  }, [room.roomCode]);

  // Auto-scroll chat container locally without triggering viewport jank
  useEffect(() => {
    const container = chatScrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const [autoAdvancing, setAutoAdvancing] = useState<boolean>(false);

  // Synchronized countdown timer
  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const updateTick = () => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    updateTick();

    const interval = setInterval(() => {
      const remaining = updateTick();

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If timer hits 0: strictly the HOST automatically transitions to voting to prevent client clock skew
      if (remaining === 0 && !autoAdvancing) {
        if (isHost) {
          setAutoAdvancing(true);
          clearInterval(interval);
          handleStartVoting();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, autoAdvancing, isHost]);

  const handleStartVoting = async () => {
    sound.playClick();
    const votingTime = room.settings.votingTimer || 30;
    await setOnlineRoomPhase(room.roomCode, 'VOTING', votingTime);
  };

  const handleSendQuickPhrase = async (phrase: string) => {
    if (cooldownSeconds > 0) return;
    sound.playClick();

    // Start 5-second local cooldown immediately
    setCooldownSeconds(5);

    const result = await sendOnlineChatMessage(room.roomCode, currentPlayer, phrase);
    if (!result.success && result.cooldownRemaining) {
      setCooldownSeconds(result.cooldownRemaining);
    }
  };

  const customQuickChats = useMemo(() => getCustomQuickChats(), []);
  const quickPhraseGroups = useMemo(
    () => ({
      suspect: customQuickChats.suspect.map((item) => (isEn ? item.en : item.bn)),
      defense: customQuickChats.defense.map((item) => (isEn ? item.en : item.bn)),
      fun: customQuickChats.fun.map((item) => (isEn ? item.en : item.bn)),
    }),
    [customQuickChats, isEn]
  );

  const quickEmojis = ['😂', '🤫', '👀', '🔥', '💀', '🕵️', '🤡', '🎯', '🍼', '🛑'];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-3 sm:p-6 max-w-3xl mx-auto transition-colors duration-200">
      {/* Top Synchronized Timer Bar */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {isEn ? 'Discussion & Quick Chat' : 'সরাসরি আলোচনা ও কুইক চ্যাট'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'Interrogate suspects before voting' : 'ভোটের পূর্বে সবাইকে জেরা করুন'}
            </p>
          </div>
        </div>

        {/* Countdown Pill in Seconds */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-mono text-base sm:text-lg font-black border transition-all ${
            timeLeft <= 10
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft} sec</span>
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
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[20vh] overflow-y-auto pt-1 border-t border-slate-100 dark:border-slate-800">
            {players.map((p) => {
              const isMe = p.id === currentPlayer.id;
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1 min-w-0 font-semibold truncate">
                      <span>{p.avatar || '🕵️'}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
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

      {/* Optimized Chat Area: Displays strictly last 3 messages */}
      <div className="my-1 flex-1 flex flex-col min-h-[30vh] max-h-[42vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs overflow-hidden">
        {/* Header indicator */}
        <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="font-bold flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-amber-500" />
            <span>{isEn ? 'Live Quick Chat (Latest 3)' : 'লাইভ কুইক চ্যাট (সর্বশেষ ৩টি)'}</span>
          </span>
          {cooldownSeconds > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <Timer className="w-3 h-3" />
              <span>{isEn ? `Wait ${cooldownSeconds}s` : `অপেক্ষা করুন ${cooldownSeconds} সে.`}</span>
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isEn ? 'Ready to send' : 'মেসেজ দেওয়ার জন্য প্রস্তুত'}
            </span>
          )}
        </div>

        {/* Messages Feed (Only Last 3 Messages Displayed) */}
        <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto space-y-2 py-2">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
              <MessageSquare className="w-7 h-7 opacity-30 mb-1" />
              <span>{isEn ? 'No messages yet. Tap a quick phrase below!' : 'এখনও কোনো বার্তা নেই। নিচে কুইক চ্যাট বাটনে ট্যাপ করুন!'}</span>
            </div>
          ) : (
            chatMessages.slice(-3).map((msg) => {
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
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
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

                    <div className="leading-relaxed break-words">{msg.text}</div>

                    <div
                      className={`text-[9px] text-right mt-0.5 ${
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
        </div>

        {/* Quick Emojis Bar */}
        <div className="py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 shrink-0">
          {quickEmojis.map((emoji) => (
            <button
              type="button"
              key={emoji}
              disabled={cooldownSeconds > 0}
              onClick={() => handleSendQuickPhrase(emoji)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 active:scale-90 text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Quick Category Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setQuickCategory('suspect')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              quickCategory === 'suspect'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isEn ? 'Suspect' : 'জেরা ও সন্দেহ'}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickCategory('defense')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              quickCategory === 'defense'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{isEn ? 'Defense' : 'আত্মরক্ষা'}</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickCategory('fun')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              quickCategory === 'fun'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Smile className="w-3 h-3" />
            <span>{isEn ? 'Fun & Banter' : 'মজা ও প্রতিক্রিয়া'}</span>
          </button>
        </div>

        {/* Quick Phrase Chips Grid */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-[14vh] overflow-y-auto no-scrollbar shrink-0">
          {quickPhraseGroups[quickCategory].map((phrase, idx) => (
            <button
              type="button"
              key={idx}
              disabled={cooldownSeconds > 0}
              onClick={() => handleSendQuickPhrase(phrase)}
              className={`p-2 rounded-xl text-left text-[11px] font-semibold border transition-all truncate cursor-pointer ${
                cooldownSeconds > 0
                  ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:bg-amber-500/10 active:scale-98'
              }`}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartVoting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Vote className="w-5 h-5" />
            <span>{isEn ? 'End Discussion & Start Voting' : 'আলোচনা শেষ করে ভোট শুরু করুন'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 py-1 font-medium">
            {isEn
              ? 'Discuss clues. Voting begins when timer ends or host advances.'
              : 'ক্লু নিয়ে আলোচনা করুন। সময় শেষ হলে বা হোস্ট ক্লিক করলে ভোট শুরু হবে।'}
          </div>
        )}
      </div>
    </div>
  );
};
