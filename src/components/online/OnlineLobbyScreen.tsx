import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Settings,
  Crown,
  UserX,
  Edit2,
  CheckCircle2,
  Clock,
  Play,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Send,
  Smile,
} from 'lucide-react';
import { Language, Theme, CategoryId } from '../../types/game';
import { OnlinePlayer, OnlineRoomData, RoomSettings, ChatMessage } from '../../types/multiplayer';
import { CATEGORIES } from '../../data/categories';
import {
  togglePlayerReady,
  updateOnlinePlayerProfile,
  updateOnlineRoomSettings,
  kickOnlinePlayer,
  leaveOnlineRoom,
  startOnlineRound,
  subscribeToChatMessages,
  sendOnlineChatMessage,
} from '../../services/multiplayerService';
import { sound } from '../../utils/audio';

interface OnlineLobbyScreenProps {
  room: OnlineRoomData;
  players: OnlinePlayer[];
  currentPlayer: OnlinePlayer;
  lang: Language;
  theme: Theme;
  onLeave: () => void;
}

export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({
  room,
  players,
  currentPlayer,
  lang,
  onLeave,
}) => {
  const isEn = lang === 'en';
  const isHost = currentPlayer.isHost;

  const [copied, setCopied] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>(currentPlayer.name);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [starting, setStarting] = useState<boolean>(false);

  // Optimized: Lobby Quick Chat (last 3 messages, 5s cooldown)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToChatMessages(room.roomCode, (messages) => {
      setChatMessages(messages.slice(-3));
    });
    return () => unsub();
  }, [room.roomCode]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 5-second cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSendQuickReaction = async (phrase: string) => {
    if (cooldownSeconds > 0) return;
    sound.playClick();
    setCooldownSeconds(5);
    const result = await sendOnlineChatMessage(room.roomCode, currentPlayer, phrase);
    if (!result.success && result.cooldownRemaining) {
      setCooldownSeconds(result.cooldownRemaining);
    }
  };

  const [tempSettings, setTempSettings] = useState<RoomSettings>({ ...room.settings });
  const [isLeavingConfirmOpen, setIsLeavingConfirmOpen] = useState<boolean>(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomCode}`;

  const handleCopyCode = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    sound.playClick();
    const shareData = {
      title: 'ধাপ্পাবাজ (Dhappabaj - Imposter Who?)',
      text: isEn
        ? `Join my Dhappabaj game room! Room Code: ${room.roomCode}`
        : `ধাপ্পাবাজ খেলায় যোগ দিন! রুম কোড: ${room.roomCode}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      handleCopyCode();
    }
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    sound.playClick();
    await updateOnlinePlayerProfile(room.roomCode, renameValue);
    setIsRenaming(false);
  };

  const handleToggleReady = async () => {
    sound.playClick();
    await togglePlayerReady(room.roomCode, !currentPlayer.isReady);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    await updateOnlineRoomSettings(room.roomCode, tempSettings);
    setIsSettingsOpen(false);
  };

  const handleKick = async (playerId: string) => {
    sound.playClick();
    await kickOnlinePlayer(room.roomCode, playerId);
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      setErrorMsg(
        isEn
          ? 'At least 3 players required to start the game'
          : 'খেলা শুরু করার জন্য কমপক্ষে ৩ জন খেলোয়াড় প্রয়োজন'
      );
      return;
    }

    setStarting(true);
    setErrorMsg(null);
    sound.playClick();
    try {
      await startOnlineRound(room.roomCode, 1);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to start game');
      setStarting(false);
    }
  };

  const handleLeaveClick = () => {
    sound.playClick();
    setIsLeavingConfirmOpen(true);
  };

  const executeLeaveRoom = async () => {
    sound.playClick();
    setIsLeavingConfirmOpen(false);
    await leaveOnlineRoom(room.roomCode);
    onLeave();
  };

  const toggleCategoryInDraft = (catId: CategoryId) => {
    sound.playClick();
    const current = tempSettings.selectedCategories || ['food', 'people', 'object', 'animal'];
    if (current.includes(catId)) {
      if (current.length === 1) return;
      setTempSettings({ ...tempSettings, selectedCategories: current.filter((c) => c !== catId) });
    } else {
      setTempSettings({ ...tempSettings, selectedCategories: [...current, catId] });
    }
  };

  const allReady = players.filter((p) => !p.isHost).every((p) => p.isReady);
  const canStart = isHost && players.length >= 3;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 max-w-4xl mx-auto transition-colors duration-200">
      {/* Top Bar with Room Code & Actions */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shrink-0">
            {room.roomCode.slice(0, 2)}
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {isEn ? 'Private Room Code' : 'প্রাইভেট রুম কোড'}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <span>{room.roomCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm"
                title={isEn ? 'Copy Room Code' : 'রুম কোড কপি করুন'}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons on Top */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Invite Friends' : 'শেয়ার করুন'}</span>
          </button>

          {isHost && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTempSettings({ ...room.settings });
                setIsSettingsOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Settings' : 'সেটিংস'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLeaveClick}
            className="px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isEn ? 'Leave Room' : 'রুম ত্যাগ করুন'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isEn ? 'Leave' : 'বের হন'}</span>
          </button>
        </div>
      </div>

      {/* Main Players Grid Section */}
      <div className="my-6 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isEn ? 'Joined Players' : 'যুক্ত খেলোয়াড়বৃন্দ'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {players.length}/{room.settings.maxPlayers || 8}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {players.length < 3
              ? isEn
                ? `Need ${3 - players.length} more to start`
                : `শুরু করতে আরও ${3 - players.length} জন প্রয়োজন`
              : isEn
              ? 'Ready to start!'
              : 'খেলা শুরুর উপযোগী!'}
          </div>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((p, index) => {
            const isMe = p.id === currentPlayer.id;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all relative ${
                  isMe
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl ${p.avatarColor || 'bg-amber-500'} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                        {p.avatar || '🕵️'}
                      </div>
                      {p.isHost && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs" title="Room Host">
                          <Crown className="w-3 h-3 fill-slate-950" />
                        </div>
                      )}
                    </div>

                    {/* Name & Title */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setRenameValue(p.name);
                              setIsRenaming(true);
                            }}
                            className="text-slate-400 hover:text-amber-500 p-0.5 cursor-pointer"
                            title={isEn ? 'Edit your name' : 'নাম পরিবর্তন করুন'}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                        {isEn ? p.titleEn : p.titleBn}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.connectionStatus === 'offline' || (Date.now() - p.lastSeenAt > 55000) ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        {isEn ? 'Offline' : 'বিচ্ছিন্ন'}
                      </span>
                    ) : null}

                    {p.isHost ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {isEn ? 'Host' : 'হোস্ট'}
                      </span>
                    ) : p.isReady ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isEn ? 'Ready' : 'প্রস্তুত'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isEn ? 'Waiting' : 'অপেক্ষমাণ'}</span>
                      </span>
                    )}

                    {/* Host kick option */}
                    {isHost && !p.isHost && (
                      <button
                        type="button"
                        onClick={() => handleKick(p.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title={isEn ? 'Remove player' : 'খেলোয়াড় বাদ দিন'}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimized: Lobby Quick Chat (Last 3 messages, 5s cooldown) */}
      <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Lobby Quick Chat' : 'লবি কুইক চ্যাট'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
              {chatMessages.length}/3
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cooldownSeconds > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold animate-pulse">
                {isEn ? `Wait ${cooldownSeconds}s` : `অপেক্ষা করুন ${cooldownSeconds} সে.`}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {isChatOpen ? (isEn ? 'Minimize' : 'ছোট করুন') : (isEn ? 'Expand' : 'খুলুন')}
            </button>
          </div>
        </div>

        {isChatOpen && (
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Messages Scroll Area - Strictly displays up to 3 messages */}
            <div className="h-24 overflow-y-auto space-y-1.5 p-1 bg-slate-50 dark:bg-slate-950/70 rounded-xl text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                  {isEn ? 'Tap a reaction below while waiting!' : 'অপেক্ষা করার সময় নিচের বাটনে ট্যাপ করুন!'}
                </div>
              ) : (
                chatMessages.slice(-3).map((msg) => {
                  const isMine = msg.senderId === currentPlayer.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                        <span>{msg.senderAvatar || '🕵️'}</span>
                        <span className="font-semibold">{msg.senderName}</span>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-xl max-w-[85%] text-xs font-medium break-words ${
                          isMine
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Emoji Reaction Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
              {['😂', '🤫', '👀', '🔥', '💀', '🕵️', '🤡', '🎯'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  disabled={cooldownSeconds > 0}
                  onClick={() => handleSendQuickReaction(emoji)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-sm transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Bangla / English Phrases */}
            <div className="flex gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              {(isEn
                ? [
                    'Start fast! 🚀',
                    'I am the imposter today! 😈',
                    'Who is the imposter? 🕵️',
                    'I am 100% innocent! 😇',
                    'Everyone ready? ⏳',
                    'Catch the liar! 💀',
                  ]
                : [
                    'দেরি কেন? খেলা শুরু করো! 🚀',
                    'আজকে আমি ধাপ্পাবাজ হব! 😈',
                    'কে ধাপ্পাবাজ হবে আজ? 🕵️',
                    'আমি কিন্তু একদম খাঁটি মানুষ! 😇',
                    'সবাই রেডি তো? ⏳',
                    'ধাপ্পাবাজ ধরা খেলে খবর আছে! 💀',
                  ]
              ).map((phrase) => (
                <button
                  type="button"
                  key={phrase}
                  disabled={cooldownSeconds > 0}
                  onClick={() => handleSendQuickReaction(phrase)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    cooldownSeconds > 0
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 active:scale-95'
                  }`}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-3 mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* If non-host: Ready button */}
        {!isHost && (
          <button
            type="button"
            onClick={handleToggleReady}
            className={`w-full py-4 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              currentPlayer.isReady
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {currentPlayer.isReady
                ? isEn ? 'Cancel Ready' : 'প্রস্তুতি বাতিল করুন'
                : isEn ? 'I am Ready!' : 'আমি প্রস্তুত!'}
            </span>
          </button>
        )}

        {/* If Host: Start button */}
        {isHost && (
          <button
            type="button"
            disabled={!canStart || starting}
            onClick={handleStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? (
              <span className="animate-spin text-xl">⏳</span>
            ) : (
              <Play className="w-6 h-6 fill-slate-950" />
            )}
            <span>
              {starting
                ? isEn ? 'Starting Game...' : 'খেলা শুরু হচ্ছে...'
                : isEn ? 'Start Game (Round 1)' : 'খেলা শুরু করুন (১ম রাউন্ড)'}
            </span>
          </button>
        )}

        {/* Game summary preview */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-rose-500" />
            {isEn ? `${room.settings.imposterCount || 1} Imposter` : `${room.settings.imposterCount || 1} জন ধাপ্পাবাজ`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            {isEn ? `${room.settings.clueTimer || 30}s Clue` : `${room.settings.clueTimer || 30} সে. ক্লু`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" />
            {isEn ? `${room.settings.discussionTimer || 90}s Discuss` : `${room.settings.discussionTimer || 90} সে. আলোচনা`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-500" />
            {isEn ? `${room.settings.votingTimer || 30}s Vote` : `${room.settings.votingTimer || 30} সে. ভোট`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-500" />
            {isEn ? `${room.settings.totalRounds} Rounds` : `${room.settings.totalRounds}টি রাউন্ড`}
          </span>
        </div>
      </div>

      {/* Rename Dialog */}
      {isRenaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEn ? 'Update Display Name' : 'নাম পরিবর্তন করুন'}
            </h3>
            <form onSubmit={handleSaveRename} className="space-y-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
                >
                  {isEn ? 'Save' : 'সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Host Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Room Game Settings' : 'রুমের খেলা সেটিংস'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Max Players (3 to 10) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Max Players (3 to 10)' : 'সর্বোচ্চ খেলোয়াড় (৩ থেকে ১০)'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => {
                        const newImposterCount = num <= 4 ? 1 : tempSettings.imposterCount;
                        setTempSettings({ ...tempSettings, maxPlayers: num, imposterCount: newImposterCount });
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        tempSettings.maxPlayers === num
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imposter count */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Number of Imposters' : 'ধাপ্পাবাজের সংখ্যা'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((num) => {
                    const isDisabled = num === 2 && (tempSettings.maxPlayers || 8) <= 4;
                    return (
                      <button
                        type="button"
                        key={num}
                        disabled={isDisabled}
                        onClick={() => setTempSettings({ ...tempSettings, imposterCount: num as 1 | 2 })}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          tempSettings.imposterCount === num
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isEn ? `${num} Imposter` : `${num} জন ধাপ্পাবাজ`}
                        {isDisabled && <span className="block text-[10px] opacity-75 font-normal">(Needs 5+ players)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clue Timer (20, 30, 45, 60s) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Player Clue Stage Time' : 'খেলোয়াড়ের ক্লু দেওয়ার সময়'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 45, 60].map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setTempSettings({ ...tempSettings, clueTimer: sec })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        (tempSettings.clueTimer || 30) === sec
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Timer (60, 90, 120, 150s / 2.30m) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Discussion Time (Max 2.30 min)' : 'আলোচনার সময় (সর্বোচ্চ ২.৩০ মিনিট)'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[60, 90, 120, 150].map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setTempSettings({ ...tempSettings, discussionTimer: sec })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        (tempSettings.discussionTimer || 90) === sec
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sec === 150 ? (isEn ? '150s (2.3m)' : '১৫০সে (২.৩মি)') : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voting Timer (20, 30, 45, 60s) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Voting Time' : 'ভোটের সময়'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 45, 60].map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setTempSettings({ ...tempSettings, votingTimer: sec })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        (tempSettings.votingTimer || 30) === sec
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Rounds */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Total Rounds' : 'মোট রাউন্ড'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 4, 5, 6].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setTempSettings({ ...tempSettings, totalRounds: r })}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        tempSettings.totalRounds === r
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  {isEn ? 'Categories' : 'ক্যাটাগরি'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => {
                    const cat = CATEGORIES[catId];
                    const selected = (tempSettings.selectedCategories || []).includes(catId);
                    return (
                      <button
                        type="button"
                        key={catId}
                        onClick={() => toggleCategoryInDraft(catId)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                          selected
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <span>{isEn ? cat.nameEn : cat.nameBn}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Imposter Final Guess Toggle */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isEn ? 'Imposter Final Guess' : 'ধাপ্পাবাজের শেষ অনুমান'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isEn ? 'Imposter can steal win if caught' : 'ধরা পড়লে শব্দ অনুমান করে জয়ের সুযোগ'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTempSettings({
                      ...tempSettings,
                      imposterFinalGuess: !tempSettings.imposterFinalGuess,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    tempSettings.imposterFinalGuess ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      tempSettings.imposterFinalGuess ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Save settings */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm cursor-pointer"
                >
                  {isEn ? 'Save Settings' : 'সেটিংস সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {isLeavingConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-2xl">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isHost
                  ? isEn
                    ? 'Close Room for All?'
                    : 'সবার জন্য রুমটি বন্ধ করতে চান?'
                  : isEn
                  ? 'Leave Room?'
                  : 'রুম ত্যাগ করতে চান?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHost
                  ? isEn
                    ? 'Leaving as host will immediately close this room for all connected players.'
                    : 'আপনি হোস্ট। আপনি বের হলে সবার জন্য এই রুমটি বন্ধ হয়ে যাবে।'
                  : isEn
                  ? 'Are you sure you want to leave this room?'
                  : 'আপনি কি নিশ্চিত যে এই রুমটি ত্যাগ করতে চান?'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLeavingConfirmOpen(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Stay' : 'থাকুন'}
              </button>

              <button
                type="button"
                onClick={executeLeaveRoom}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Leave Room' : 'বেরিয়ে যান'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
