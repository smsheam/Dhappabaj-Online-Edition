import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, LogIn, X, ExternalLink, ShieldCheck, AlertCircle, Wifi, RefreshCw, Activity } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { PLAYER_AVATARS } from '../../data/avatars';
import { createOnlineRoom, joinOnlineRoom, DEFAULT_ONLINE_SETTINGS } from '../../services/multiplayerService';
import { sound } from '../../utils/audio';
import { OnlinePlayer, OnlineRoomData } from '../../types/multiplayer';
import { signInWithGoogle, auth, ensureAuthenticatedUser, resetToFreshSession } from '../../firebase';
import { testProductionConnectivity, getProductionDiagnostics, ConnectivityTestResult } from '../../utils/productionDiagnostics';

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

  // Fresh session: Do not linger old names in localStorage across page refreshes
  const [name, setName] = useState<string>(() => {
    try {
      localStorage.removeItem('dhappabaj_name');
    } catch {}
    return sessionStorage.getItem('dhappabaj_session_name') || '';
  });
  const [avatar, setAvatar] = useState<string>(() => {
    return sessionStorage.getItem('dhappabaj_session_avatar') || '🕵️';
  });
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [isPickingAvatar, setIsPickingAvatar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsGoogleSignIn, setNeedsGoogleSignIn] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagResult, setDiagResult] = useState<ConnectivityTestResult | null>(null);
  const [testingDiag, setTestingDiag] = useState<boolean>(false);
  const [resettingIdentity, setResettingIdentity] = useState<boolean>(false);

  const handleResetSession = async () => {
    setResettingIdentity(true);
    sound.playClick();
    try {
      await resetToFreshSession();
      setName('');
      setError(null);
    } catch (e) {
      console.error(e);
    } finally {
      setResettingIdentity(false);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setTestingDiag(true);
    sound.playClick();
    try {
      const res = await testProductionConnectivity();
      setDiagResult(res);
    } catch (e: any) {
      setDiagResult({
        success: false,
        authLatencyMs: 0,
        dbLatencyMs: 0,
        totalTimeMs: 0,
        userId: null,
        error: e?.message || String(e),
        guidance: 'Could not connect. Please check network.',
      });
    } finally {
      setTestingDiag(false);
    }
  };

  // Eagerly ensure auth on mount
  useEffect(() => {
    ensureAuthenticatedUser().catch(() => {});
  }, []);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    try {
      sessionStorage.setItem('dhappabaj_session_name', val);
      localStorage.removeItem('dhappabaj_name');
    } catch {}
  };

  const handleAvatarChange = (em: string) => {
    setAvatar(em);
    try {
      sessionStorage.setItem('dhappabaj_session_avatar', em);
    } catch {}
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
      let result;
      try {
        result = await createOnlineRoom(name, avatar);
      } catch (firstErr: any) {
        const isTransient =
          firstErr?.message?.includes('offline') ||
          firstErr?.code === 'unavailable' ||
          firstErr?.message?.includes('unavailable') ||
          firstErr?.message?.includes('timed out');
        if (isTransient) {
          await new Promise((r) => setTimeout(r, 600));
          result = await createOnlineRoom(name, avatar);
        } else {
          throw firstErr;
        }
      }

      onRoomJoined(result.roomData, result.player);
    } catch (err: any) {
      console.error('Room create error:', err);
      const isRestricted =
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('admin-restricted-operation');

      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable') ||
        err?.message?.includes('timed out');

      if (isRestricted) {
        setNeedsGoogleSignIn(true);
        setError(
          isEn
            ? 'Anonymous guest login is not enabled in Firebase. Click below to continue with Google.'
            : 'প্রজেক্টে অ্যানোনিমাস লগইন সক্রিয় নেই। নিচে Google দিয়ে প্রবেশ করুন।'
        );
      } else if (isOffline) {
        setError(
          isEn
            ? 'Network connection issue or timeout. Tap retry below.'
            : 'নেটওয়ার্ক সংযোগে সমস্যা বা সময় শেষ হয়েছে। নিচে পুনরায় চেষ্টা বাটনে ট্যাপ করুন।'
        );
      } else {
        let cleanMsg = err?.message || '';
        try {
          if (cleanMsg.startsWith('{') && cleanMsg.endsWith('}')) {
            const parsed = JSON.parse(cleanMsg);
            cleanMsg = parsed.error || cleanMsg;
          }
        } catch {}
        setError(cleanMsg || (isEn ? 'Failed to create room. Please retry.' : 'রুম তৈরি করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'));
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
      let result;
      try {
        result = await joinOnlineRoom(cleanCode, name, avatar);
      } catch (firstErr: any) {
        const isTransient =
          firstErr?.message?.includes('offline') ||
          firstErr?.code === 'unavailable' ||
          firstErr?.message?.includes('unavailable') ||
          firstErr?.message?.includes('timed out');
        if (isTransient) {
          await new Promise((r) => setTimeout(r, 600));
          result = await joinOnlineRoom(cleanCode, name, avatar);
        } else {
          throw firstErr;
        }
      }

      onRoomJoined(result.roomData, result.player);
    } catch (err: any) {
      console.error('Room join error:', err);
      const isRestricted =
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('admin-restricted-operation');

      const isOffline =
        err?.message?.includes('offline') ||
        err?.code === 'unavailable' ||
        err?.message?.includes('unavailable') ||
        err?.message?.includes('timed out');

      if (isRestricted) {
        setNeedsGoogleSignIn(true);
        setError(
          isEn
            ? 'Anonymous guest login is not enabled in Firebase. Click below to continue with Google.'
            : 'প্রজেক্টে অ্যানোনিমাস লগইন সক্রিয় নেই। নিচে Google দিয়ে প্রবেশ করুন।'
        );
      } else if (isOffline) {
        setError(
          isEn
            ? 'Network connection issue or timeout. Tap retry below.'
            : 'নেটওয়ার্ক সংযোগে সমস্যা বা সময় শেষ হয়েছে। নিচে পুনরায় চেষ্টা বাটনে ট্যাপ করুন।'
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isEn ? 'Your Display Name & Avatar' : 'আপনার নাম ও অবতার'}
              </label>
              <button
                type="button"
                onClick={handleResetSession}
                disabled={resettingIdentity}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                title={isEn ? 'Start as fresh new guest player' : 'নতুন খেলোয়াড় হিসেবে রিসেট করুন'}
              >
                <RefreshCw className={`w-3 h-3 ${resettingIdentity ? 'animate-spin' : ''}`} />
                <span>{isEn ? 'New Identity' : 'নতুন খেলোয়াড়'}</span>
              </button>
            </div>
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

          {/* 1-Click Google Sign-In button if user prefers or if anonymous auth had issues */}
          {needsGoogleSignIn && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold">
                    {isEn ? '1-Click Google Sign-In:' : '১-ক্লিকে গুগল সাইন-ইন:'}
                  </span>{' '}
                  {isEn
                    ? 'You can sign in with your Google account to host or join instantly.'
                    : 'গুগল অ্যাকাউন্ট দিয়ে নিমেষেই হোস্ট করতে পারেন।'}
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignInAndProceed}
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-900 dark:text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
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
            </div>
          )}

          {/* Error Message with instant Retry / Reset buttons */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold space-y-2">
              <p>{error}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem('dhappabaj_active_room');
                    setError(null);
                    setNeedsGoogleSignIn(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {isEn ? 'Clear Cache & Retry' : 'ক্যাশ মুছে আবার চেষ্টা করুন'}
                </button>
              </div>
            </div>
          )}

          {/* Standard submit button for instant guest hosting/joining */}
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
                ? isEn ? 'Connecting...' : 'রুম তৈরি হচ্ছে...'
                : activeTab === 'create'
                ? isEn ? 'Create Room & Host' : 'রুম তৈরি ও হোস্ট করুন'
                : isEn ? 'Join Private Room' : 'রুমে প্রবেশ করুন'}
            </span>
          </button>

          {/* Production Diagnostics & Network Status */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Cloud: Ready</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDiagnostics(!showDiagnostics);
                  if (!diagResult && !testingDiag) handleRunDiagnosticTest();
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Activity className="w-3 h-3" />
                <span>{showDiagnostics ? (isEn ? 'Hide Status' : 'স্ট্যাটাস বন্ধ') : (isEn ? 'Diagnostics' : 'নেটওয়ার্ক পরীক্ষা')}</span>
              </button>
            </div>

            {showDiagnostics && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Database ID:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {getProductionDiagnostics().firestoreDatabaseId}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Host Auth UID:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {auth.currentUser?.uid ? `${auth.currentUser.uid.slice(0, 10)}...` : 'Connecting...'}
                  </span>
                </div>

                {diagResult && (
                  <div className={`p-2 rounded-lg text-[11px] ${diagResult.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    {diagResult.success ? (
                      <p>✓ All systems active. Total latency: {diagResult.totalTimeMs}ms (Auth: {diagResult.authLatencyMs}ms, DB: {diagResult.dbLatencyMs}ms)</p>
                    ) : (
                      <p>✗ {diagResult.error} — {diagResult.guidance}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={testingDiag}
                  onClick={handleRunDiagnosticTest}
                  className="w-full py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${testingDiag ? 'animate-spin' : ''}`} />
                  <span>{testingDiag ? (isEn ? 'Testing connection...' : 'পরীক্ষা চলছে...') : (isEn ? 'Re-test Production Ping' : 'সংযোগ পুনরায় পিং করুন')}</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
