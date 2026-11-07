import React, { useState, useRef } from 'react';
import { Download, Share2, MessageCircle, Facebook, Copy, Check, Sparkles, Trophy, Crown } from 'lucide-react';
import { Language } from '../../types/game';
import { sound } from '../../utils/audio';

export interface ScoreboardPlayerItem {
  id: string;
  name: string;
  avatar: string;
  score: number;
  role?: string;
}

interface ScoreboardShareCardProps {
  champion: ScoreboardPlayerItem;
  players: ScoreboardPlayerItem[];
  matchMode: string;
  totalRounds?: number;
  lang: Language;
}

export const ScoreboardShareCard: React.FC<ScoreboardShareCardProps> = ({
  champion,
  players,
  matchMode,
  totalRounds = 5,
  lang,
}) => {
  const isEn = lang === 'en';
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Generate high-resolution card image using standard Canvas 2D
  const generateCardBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const width = 800;
        const height = 1000;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // 1. Dark Gradient Background
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f172a'); // slate-900
        grad.addColorStop(0.5, '#1e1b4b'); // indigo-950
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle glowing accent circles
        const radialGrad = ctx.createRadialGradient(width / 2, 220, 10, width / 2, 220, 320);
        radialGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        radialGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Outer Border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.strokeRect(24, 24, width - 48, height - 48);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, width - 64, height - 64);

        // 3. Header Branding
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 24px system-ui, -apple-system, sans-serif';
        ctx.fillText('DHAPPABAJ • ধাপ্পাবাজ', width / 2, 75);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(`OFFICIAL MATCH SCOREBOARD • ${matchMode.toUpperCase()} (${totalRounds} ROUNDS)`, width / 2, 102);

        // 4. Champion Highlight Box
        const champBoxY = 130;
        const champBoxH = 220;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(60, champBoxY, width - 120, champBoxH, 24);
        ctx.fill();
        ctx.stroke();

        // Crown & Avatar
        ctx.font = '54px system-ui, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillText('👑', width / 2, champBoxY + 55);

        ctx.font = '60px system-ui, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillText(champion.avatar || '🕵️', width / 2, champBoxY + 125);

        // Champion Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px system-ui, -apple-system, sans-serif';
        ctx.fillText(champion.name, width / 2, champBoxY + 168);

        // Champion Score Banner
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`🏆 MATCH CHAMPION • ${champion.score} POINTS 🏆`, width / 2, champBoxY + 200);

        // 5. Leaderboard Section Header
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '800 18px system-ui, -apple-system, sans-serif';
        ctx.fillText('FINAL LEADERBOARD STANDINGS', width / 2, 390);

        // Leaderboard Table
        const listStartY = 415;
        const rowHeight = 52;
        const maxRows = Math.min(sortedPlayers.length, 7);

        for (let i = 0; i < maxRows; i++) {
          const p = sortedPlayers[i];
          const y = listStartY + i * (rowHeight + 10);

          // Row background
          ctx.fillStyle = i === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)';
          ctx.strokeStyle = i === 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(60, y, width - 120, rowHeight, 14);
          ctx.fill();
          ctx.stroke();

          // Rank #
          ctx.textAlign = 'left';
          ctx.fillStyle = i === 0 ? '#fbbf24' : '#94a3b8';
          ctx.font = '800 20px system-ui, -apple-system, sans-serif';
          ctx.fillText(`#${i + 1}`, 82, y + 33);

          // Avatar & Name
          ctx.font = '26px system-ui, Apple Color Emoji, Segoe UI Emoji';
          ctx.fillText(p.avatar || '🕵️', 125, y + 35);

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 19px system-ui, -apple-system, sans-serif';
          const truncatedName = p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name;
          ctx.fillText(truncatedName, 170, y + 33);

          // Score
          ctx.textAlign = 'right';
          ctx.fillStyle = i === 0 ? '#fbbf24' : '#38bdf8';
          ctx.font = '800 20px system-ui, -apple-system, sans-serif';
          ctx.fillText(`${p.score} pts`, width - 85, y + 33);
        }

        // 6. Footer Call-to-Action
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f59e0b';
        ctx.font = '800 17px system-ui, -apple-system, sans-serif';
        ctx.fillText('🕵️ Play Dhappabaj with your friends & family!', width / 2, height - 70);

        ctx.fillStyle = '#64748b';
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        ctx.fillText('Unmask the imposter hiding among you • Free online game', width / 2, height - 48);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      } catch (err) {
        console.error('Canvas generation error:', err);
        resolve(null);
      }
    });
  };

  const shareText = `🏆 Dhappabaj Match Results!
Champion: ${champion.name} (${champion.score} pts) 👑
Leaderboard:
${sortedPlayers.map((p, idx) => `${idx + 1}. ${p.name} - ${p.score} pts`).join('\n')}

Play Dhappabaj (ধাপ্পাবাজ) now: ${window.location.origin}`;

  // 1. Download Scoreboard Image
  const handleDownload = async () => {
    try {
      sound.playClick();
      setIsGenerating(true);
      const blob = await generateCardBlob();
      if (!blob) {
        alert(isEn ? 'Failed to generate scoreboard image.' : 'ছবি তৈরি করা সম্ভব হয়নি।');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dhappabaj_Champion_${champion.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Share to WhatsApp
  const handleWhatsAppShare = () => {
    sound.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // 3. Share to Facebook
  const handleFacebookShare = () => {
    sound.playClick();
    const shareUrl = encodeURIComponent(window.location.origin);
    const quote = encodeURIComponent(`🏆 Dhappabaj Match Champion: ${champion.name} with ${champion.score} points! Can you catch the imposter?`);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // 4. Native Web Share (Share image file directly to WhatsApp/Facebook/Instagram/Messenger on Mobile)
  const handleNativeShare = async () => {
    sound.playClick();
    setIsGenerating(true);
    try {
      const blob = await generateCardBlob();
      if (blob && navigator.share) {
        const file = new File([blob], `Dhappabaj_Scoreboard_${Date.now()}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Dhappabaj Champion: ${champion.name}!`,
            text: shareText,
            files: [file],
          });
          setIsGenerating(false);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: `Dhappabaj Champion: ${champion.name}!`,
          text: shareText,
          url: window.location.origin,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        navigator.clipboard?.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Copy text
  const handleCopyText = async () => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-2xl space-y-5 my-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-400">
              {isEn ? 'Share Champion Scoreboard' : 'চ্যাম্পিয়ন স্কোরবোর্ড শেয়ার'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {isEn ? 'Download card image or share directly to social media' : 'ছবি ডাউনলোড করুন বা সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
          HD CARD
        </span>
      </div>

      {/* Mini Visual Preview of the Champion */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
              {champion.avatar || '🕵️'}
            </div>
            <div className="absolute -top-2 -right-1 text-base">👑</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
              {isEn ? 'Match Champion' : 'ম্যাচ চ্যাম্পিয়ন'}
            </div>
            <div className="text-lg font-black text-white">{champion.name}</div>
            <div className="text-xs text-slate-400 font-semibold">{champion.score} {isEn ? 'points' : 'পয়েন্ট'}</div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          <div>{players.length} {isEn ? 'players' : 'জন খেলোয়াড়'}</div>
          <div className="text-emerald-400 font-bold">{isEn ? 'Ready to share' : 'শেয়ারের জন্য প্রস্তুত'}</div>
        </div>
      </div>

      {/* Sharing & Download Actions */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Download Card Image */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? (isEn ? 'Generating...' : 'তৈরি হচ্ছে...') : (isEn ? 'Download Image' : 'ছবি ডাউনলোড')}</span>
          </button>

          {/* 2. Native Share / Any Social App */}
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{isEn ? 'Share to Any App' : 'সোশ্যাল মিডিয়ায় শেয়ার'}</span>
          </button>
        </div>

        {/* Social Direct Links: WhatsApp & Facebook & Copy */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* WhatsApp Direct */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title={isEn ? 'Share to WhatsApp' : 'হোয়াটসঅ্যাপে শেয়ার'}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Facebook Direct */}
          <button
            type="button"
            onClick={handleFacebookShare}
            className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title={isEn ? 'Share to Facebook' : 'ফেসবুকে শেয়ার'}
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </button>

          {/* Copy Results Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title={isEn ? 'Copy Results' : 'কপি করুন'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (isEn ? 'Copied!' : 'কপি হয়েছে') : (isEn ? 'Copy Text' : 'টেক্সট কপি')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
