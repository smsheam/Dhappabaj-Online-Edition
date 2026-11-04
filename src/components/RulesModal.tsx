import React from 'react';
import { X, Award, BookOpen } from 'lucide-react';
import { Language } from '../types/game';
import { sound } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-wide">
              {isEn ? '🎭 Dhappabaj: Game Rules' : '🎭 ধাপ্পাবাজ: খেলার নিয়মাবলি'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isEn ? (
            /* ENGLISH RULES */
            <>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">1. Game Setup</h4>
                <p className="mt-1">
                  Played with 3–10 players. All players share a common themed scene (e.g. Cabinet Ministry, Police Station, Hospital, Courtroom, Airport, or Newsroom) with Player 1 as the scene chief. Choose 1 to 3 Imposters based on player count. Total rounds equal player count.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">2. Secret Word & Flash Cards</h4>
                <p className="mt-1">
                  Each player secretly views their flash card. Regular players receive the exact secret word. The Imposter does NOT see the word—instead they receive a smart clue/hint related to the word.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">3. Word Description</h4>
                <p className="mt-1">
                  Players take turns giving one subtle clue about the secret word. Do not say the word directly! The Imposter must listen carefully and pretend they know the word.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">4. Rotating Turn Order</h4>
                <p className="mt-1">
                  Round 1 starts with Player 1. Round 2 starts with Player 2. The final round starts with the last player, giving everyone equal opportunity.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">5. Voting</h4>
                <p className="mt-1">
                  After discussion, everyone votes for who they suspect is the Imposter. You cannot vote for yourself.
                </p>
              </div>

              {/* Scoring */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>Practical Scoring System</span>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-850 font-mono">
                    <tr>
                      <td className="py-1 font-sans">Correct Imposter vote</td>
                      <td className="py-1 text-right text-emerald-600 dark:text-emerald-400 font-bold">+4 pts</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Eliminated Imposter bonus</td>
                      <td className="py-1 text-right text-emerald-600 dark:text-emerald-400 font-bold">+1 pt</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Mistaken vote on Citizen</td>
                      <td className="py-1 text-right text-rose-600 dark:text-rose-400 font-bold">-1 pt</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Wrongly eliminated Citizen bonus</td>
                      <td className="py-1 text-right text-amber-600 dark:text-amber-400 font-bold">+3 pts</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Imposter survived & won</td>
                      <td className="py-1 text-right text-amber-600 dark:text-amber-400 font-bold">+5 pts</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Imposter won with 0 votes bonus</td>
                      <td className="py-1 text-right text-sky-600 dark:text-sky-400 font-bold">+3 Bonus</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">Imposter caught & eliminated</td>
                      <td className="py-1 text-right text-slate-500 font-bold">0 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* BENGALI RULES */
            <>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">১. গেম সেটআপ (Game Setup)</h4>
                <p className="mt-1">
                  ৩–১০ জন খেলোয়াড় নিয়ে খেলা হবে। সব খেলোয়াড় একটি নির্দিষ্ট থিম সিনারিও (যেমন মন্ত্রী পরিষদ, পুলিশ স্টেশন, হাসপাতাল, আদালত, এয়ারপোর্ট বা নিউজরুম)-এর অন্তর্ভুক্ত চরিত্রে অংশ নেবেন এবং ১ম খেলোয়াড় হবেন প্রধান। খেলোয়াড় সংখ্যা অনুযায়ী ১–৩ জন Imposter এবং মোট রাউন্ড খেলোয়াড় সংখ্যার সমান।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">২. গোপন শব্দ ও ফ্ল্যাশ কার্ড (Secret Word)</h4>
                <p className="mt-1">
                  প্রত্যেক খেলোয়াড় গোপনে নিজের ফ্ল্যাশ কার্ড দেখবেন। সাধারণ খেলোয়াড়রা আসল শব্দ দেখতে পাবেন। Imposter শব্দের পরিবর্তে একটি চতুর ইঙ্গিত (Hint) পাবে।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">৩. শব্দ বর্ণনা ও কথা বলার ক্রম</h4>
                <p className="mt-1">
                  প্রত্যেকে পালাক্রমে শব্দটি সরাসরি উচ্চারণ না করে হালকা ইঙ্গিত দেবেন। ১ম রাউন্ডে ১ম খেলোয়াড়, ২য় রাউন্ডে ২য় খেলোয়াড় এবং শেষ রাউন্ডে শেষ খেলোয়াড় প্রথমে কথা বলবেন।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">৪. ভোট প্রদান ও ফলাফল</h4>
                <p className="mt-1">
                  আলোচনা শেষে প্রত্যেকে সন্দেহভাজন Imposter-কে ভোট দেবেন। নিজের নামে ভোট দেওয়া যাবে না। এরপর আসল শব্দ ও ফলাফল উন্মোচিত হবে।
                </p>
              </div>

              {/* Scoring */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>ব্যবহারিক স্কোরিং নিয়মাবলি</span>
                </div>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-850 font-mono">
                    <tr>
                      <td className="py-1 font-sans">সঠিক ধাপ্পাবাজকে ভোট দেওয়া</td>
                      <td className="py-1 text-right text-emerald-600 dark:text-emerald-400 font-bold">+৪</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">ধাপ্পাবাজ বহিষ্কার বোনাস</td>
                      <td className="py-1 text-right text-emerald-600 dark:text-emerald-400 font-bold">+১</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">নির্দোষকে ভুল ভোট দেওয়া</td>
                      <td className="py-1 text-right text-rose-600 dark:text-rose-400 font-bold">-১</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">নির্দোষ বহিষ্কৃত হওয়ার সান্ত্বনা বোনাস</td>
                      <td className="py-1 text-right text-amber-600 dark:text-amber-400 font-bold">+৩</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">ধাপ্পাবাজ জয়ী হলে</td>
                      <td className="py-1 text-right text-amber-600 dark:text-amber-400 font-bold">+৫</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">ধাপ্পাবাজ কোনো ভোট না পাওয়ার বোনাস</td>
                      <td className="py-1 text-right text-sky-600 dark:text-sky-400 font-bold">+৩ বোনাস</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-sans">ধাপ্পাবাজ ধরা পড়লে / হারলে</td>
                      <td className="py-1 text-right text-slate-500 font-bold">০ পয়েন্ট</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all cursor-pointer"
          >
            {isEn ? 'Close Rules' : 'বুঝেছি, বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
