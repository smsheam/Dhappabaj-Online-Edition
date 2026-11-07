import React, { useState } from 'react';
import { Shield, Sparkles, User, AlertCircle, X } from 'lucide-react';
import { Language, Theme } from '../../types/game';
import { UserProfile } from '../../types/user';
import { loginWithGoogle, loginAsGuest } from '../../services/userService';
import { sound } from '../../utils/audio';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
  onAuthenticated: (profile: UserProfile) => void;
  lang: Language;
  theme: Theme;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
  onAuthenticated,
  lang,
}) => {
  const isEn = lang === 'en';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      sound.playClick();
      setIsLoading(true);
      setAuthError(null);
      const profile = await loginWithGoogle();
      onAuthenticated(profile);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let msg = isEn ? 'Failed to sign in with Google' : 'Google দিয়ে সাইন ইন করা সম্ভব হয়নি';
      if (err?.code === 'auth/popup-closed-by-user') {
        msg = isEn ? 'Sign-in cancelled' : 'সাইন ইন উইন্ডোটি বন্ধ করা হয়েছে';
      } else if (err?.code === 'auth/network-request-failed') {
        msg = isEn ? 'Network error. Please check your connection.' : 'নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ পরীক্ষা করুন।';
      } else if (err?.message) {
        msg = err.message;
      }
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      sound.playClick();
      setIsLoading(true);
      setAuthError(null);
      const profile = await loginAsGuest();
      onAuthenticated(profile);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Guest Auth Error:', err);
      setAuthError(isEn ? 'Failed to start guest session' : 'গেস্ট হিসেবে শুরু করা যায়নি');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-center relative animate-in zoom-in-95 duration-200">
        {canDismiss && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl shadow-lg">
            🕵️
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isEn ? 'Welcome to Dhappabaj' : 'ধাপ্পাবাজে সাইন ইন'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isEn
                ? 'Sign in to sync your score, skins & achievements'
                : 'আপনার পয়েন্ট, খেতাব ও প্রোফাইল সংরক্ষিত রাখতে সাইন ইন করুন'}
            </p>
          </div>
        </div>

        {authError && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{authError}</span>
          </div>
        )}

        <div className="space-y-2.5">
          {/* 1. Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isLoading
                ? isEn ? 'Signing in...' : 'সাইন ইন হচ্ছে...'
                : isEn ? 'Sign In with Google' : 'Google দিয়ে সাইন ইন'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider py-1">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span>{isEn ? 'OR' : 'অথবা'}</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* 2. Play as Guest */}
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>{isEn ? 'Play as Guest' : 'গেস্ট হিসেবে খেলুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
