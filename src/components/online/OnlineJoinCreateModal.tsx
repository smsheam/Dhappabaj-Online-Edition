import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, LogIn, X, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { PLAYER_AVATARS } from '../../data/avatars';
import { createOnlineRoom, joinOnlineRoom, DEFAULT_ONLINE_SETTINGS } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { signInWithGoogle, auth } from '../../firebase';

interface OnlineJoinCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
  initialRoomCode?: string;
  onRoomJoined: (roomData: OnlineRoomData, player: OnlinePlayer) => void;
}

export const OnlineJoinCreateModal: React.FC<OnlineJoinCreateModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialRoomCode = '',
  onRoomJoined,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');

  // Stored name & avatar in localStorage for convenience
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('dhappabaj_name') || auth.currentUser?.displayName || '';
  });
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('dhappabaj_avatar') || '🕵️';
  });
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [isPickingAvatar, setIsPickingAvatar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsGoogleSignIn, setNeedsGoogleSignIn] = useState<boolean>(false);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    localStorage.setItem('dhappabaj_name', val);
  };

  const handleAvatarChange = (em: string) => {
    setAvatar(em);
    localStorage.setItem('dhappabaj_avatar', em);
    setIsPickingAvatar(false);
  };

  const handleGoogleSignInAndProceed = async () => {
    setLoading(true);
    setError(null);
    sound.playClick();
    try {
      const user = await signInWithGoogle();
      const finalName = name.trim() || user.displayName || 'Player';
      setName(finalName);
      setNeedsGoogleSignIn(false);

      if (activeTab === 'create') {
        const { roomData, player } = await createOnlineRoom(finalName, avatar);
        onRoomJoined(roomData, player);
      } else {
        const cleanCode = roomCode.trim().toUpperCase();
        const { roomData, player } = await joinOnlineRoom(cleanCode, finalName, avatar);
        onRoomJoined(roomData, player);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isEn ? 'Google sign-in failed' : 'গুগল সাইন-ইন ব্যর্থ হয়েছে'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(isEn ? 'Please enter your name' : 'অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }

    setLoading(true);
    sound.playClick();
    try {
      const createPromise = createOnlineRoom(name, avatar);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                isEn
                  ? 'Connection timeout. Please check your internet and retry.'
                  : 'সংযোগের সময় শেষ হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।'
              )
            ),
          12000
        )
      );

      const { roomData, player } = await Promise.race([createPromise, timeoutPromise]);
      onRoomJoined(roomData, player);
    } catch (err: any) {
      console.error('Room create error:', err);
      const isRestricted =
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('admin-restricted-operation');

      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable');

      if (isRestricted) {
        setNeedsGoogleSignIn(true);
        setError(
          isEn
            ? 'Anonymous guest login is not enabled in Firebase yet. Click below to continue with Google or enable Anonymous in Firebase Console.'
            : 'প্রজেক্টে অ্যানোনিমাস লগইন সক্রিয় নেই। নিচে Google দিয়ে প্রবেশ করুন অথবা Firebase Console এ Anonymous চালু করুন।'
        );
      } else if (isOffline) {
        setError(
          isEn
            ? 'Network connection issue. Please check your internet connection and retry.'
            : 'নেটওয়ার্ক সংযোগে সমস্যা হচ্ছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।'
        );
      } else {
        let cleanMsg = err?.message || '';
        try {
          if (cleanMsg.startsWith('{') && cleanMsg.endsWith('}')) {
            const parsed = JSON.parse(cleanMsg);
            cleanMsg = parsed.error || cleanMsg;
          }
        } catch {}
        setError(cleanMsg || (isEn ? 'Failed to create room' : 'রুম তৈরি করতে সমস্যা হয়েছে'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(isEn ? 'Please enter your name' : 'অনুগ্রহ করে আপনার নাম লিখুন');
      return;
    }
    const cleanCode = roomCode.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError(isEn ? 'Please enter a valid 6-character room code' : '৬ অক্ষরের সঠিক রুম কোড দিন');
      return;
    }

    setLoading(true);
    sound.playClick();
    try {
      const joinPromise = joinOnlineRoom(cleanCode, name, avatar);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                isEn
                  ? 'Connection timeout. Please check your internet and retry.'
                  : 'সংযোগের সময় শেষ হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।'
              )
            ),
          12000
        )
      );

      const { roomData, player } = await Promise.race([joinPromise, timeoutPromise]);
      onRoomJoined(roomData, player);
    } catch (err: any) {
      console.error('Room join error:', err);
      const isRestricted =
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('admin-restricted-operation');

      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable');

      if (isRestricted) {
        setNeedsGoogleSignIn(true);
        setError(
          isEn
            ? 'Anonymous guest login is not enabled in Firebase yet. Click below to continue with Google or enable Anonymous in Firebase Console.'
            : 'প্রজেক্টে অ্যানোনিমাস লগইন সক্রিয় নেই। নিচে Google দিয়ে প্রবেশ করুন অথবা Firebase Console এ Anonymous চালু করুন।'
        );
      } else if (isOffline) {
        setError(
          isEn
            ? 'Network connection issue. Please check your internet connection and retry.'
            : 'নেটওয়ার্ক সংযোগে সমস্যা হচ্ছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।'
        );
      } else {
        let cleanMsg = err?.message || '';
        try {
          if (cleanMsg.startsWith('{') && cleanMsg.endsWith('}')) {
            const parsed = JSON.parse(cleanMsg);
            cleanMsg = parsed.error || cleanMsg;
          }
        } catch {}
        setError(cleanMsg || (isEn ? 'Failed to join room' : 'রুমে যোগ দিতে সমস্যা হয়েছে'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEn ? 'Online Private Room' : 'অনলাইন প্রাইভেট রুম'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Play across separate mobile devices' : 'আলাদা মোবাইল থেকে একসাথে খেলুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('create');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isEn ? 'Create Room' : 'রুম তৈরি করুন'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('join');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isEn ? 'Join Room' : 'রুমে যোগ দিন'}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={activeTab === 'create' ? handleCreate : handleJoin} className="space-y-4">
          {/* Player Name and Avatar selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isEn ? 'Your Display Name & Avatar' : 'আপনার নাম ও অবতার'}
            </label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsPickingAvatar(!isPickingAvatar);
                }}
                className="w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-2xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
                title={isEn ? 'Change Avatar' : 'অবতার বদলান'}
              >
                {avatar}
              </button>

              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={20}
                placeholder={isEn ? 'Enter your name (e.g. Sheam)' : 'নাম লিখুন (যেমন: সিয়াম)'}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Avatar selector modal/drawer */}
          {isPickingAvatar && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {isEn ? 'Select an avatar' : 'অবতার নির্বাচন করুন'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickingAvatar(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {PLAYER_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAvatarChange(item.emoji)}
                    className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer ${
                      avatar === item.emoji
                        ? 'bg-amber-500/30 scale-110 shadow-xs'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Room code input for Join tab */}
          {activeTab === 'join' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isEn ? '6-Character Room Code' : '৬ অক্ষরের রুম কোড'}
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                placeholder="e.g. 7K9X2B"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center text-lg font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* 1-Click Google Sign-In button if Anonymous Auth is disabled */}
          {needsGoogleSignIn && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold">
                    {isEn ? '1-Click Google Sign-In:' : '১-ক্লিকে গুগল সাইন-ইন:'}
                  </span>{' '}
                  {isEn
                    ? 'Firebase Google sign-in is ready. Click below to connect instantly.'
                    : 'গুগল সাইন-ইন প্রস্তুত রয়েছে। নিচের বাটনে ট্যাপ করে সাথে সাথে যুক্ত হন।'}
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignInAndProceed}
                className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-900 dark:text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {loading
                    ? isEn ? 'Connecting...' : 'সংযোগ হচ্ছে...'
                    : activeTab === 'create'
                    ? isEn ? 'Sign in with Google & Host' : 'Google দিয়ে সাইন-ইন ও হোস্ট করুন'
                    : isEn ? 'Sign in with Google & Join' : 'Google দিয়ে সাইন-ইন ও যোগ দিন'}
                </span>
              </button>

              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{isEn ? 'Want 100% login-free guest access? ' : 'লগইন ছাড়া গেস্ট মোড চান? '}</span>
                <a
                  href="https://console.firebase.google.com/project/semiotic-dryad-kwpgt/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-600 dark:text-amber-400 font-semibold underline inline-flex items-center gap-0.5"
                >
                  <span>{isEn ? 'Enable Anonymous in Console' : 'Firebase Console এ Anonymous চালু করুন'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* Error Message if not needsGoogleSignIn */}
          {error && !needsGoogleSignIn && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Standard submit button if not in needsGoogleSignIn mode */}
          {!needsGoogleSignIn && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin mr-2">⏳</span>
              ) : activeTab === 'create' ? (
                <PlusCircle className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              <span>
                {loading
                  ? isEn ? 'Connecting...' : 'সংযোগ হচ্ছে...'
                  : activeTab === 'create'
                  ? isEn ? 'Create Room & Host' : 'রুম তৈরি ও হোস্ট করুন'
                  : isEn ? 'Join Private Room' : 'রুমে প্রবেশ করুন'}
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
