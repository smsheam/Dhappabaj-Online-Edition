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
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, ChatMessage } from '../../types/multiplayer';
import {
  setOnlineRoomPhase,
  sendOnlineChatMessage,
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

  // Synchronized Discussion Timer
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!room.phaseEndsAt) return room.settings.discussionTimer || 90;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  });

  // Subscribe to real-time chat
  useEffect(() => {
    const unsub = subscribeToChatMessages(room.roomCode, (messages) => {
      setChatMessages(messages);
    });
    return () => unsub();
  }, [room.roomCode]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!room.phaseEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 5 && remaining > 0) {
        sound.playTimerTick();
      }

      // If timer hits 0 and player is host, automatically transition to voting
      if (remaining === 0 && isHost) {
        clearInterval(interval);
        handleStartVoting();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.phaseEndsAt, isHost]);

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
    ? ['You are the imposter! 🕵️', 'I am innocent! 🛡️', 'Suspicious clue! 🤔', 'Why so quiet? 🤐']
    : ['তুমিই ধাপ্পাবাজ! 🕵️', 'আমি নির্দোষ নাগরিক! 🛡️', 'ক্লুটা কেমন যেন! 🤔', 'চুপচাপ কেন? 🤐'];

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
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-xl border text-xs ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1 font-semibold truncate text-[11px] text-slate-600 dark:text-slate-300">
                    <span>{p.avatar || '🕵️'}</span>
                    <span className="truncate">{p.name}</span>
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
                    <div className="leading-relaxed break-words">{msg.text}</div>
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

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0 pt-1">
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
