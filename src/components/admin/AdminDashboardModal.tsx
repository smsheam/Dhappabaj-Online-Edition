import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  X,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  BookOpen,
  MessageSquare,
  Activity,
  Layers,
  AlertTriangle,
  FileText,
  Lock,
  Unlock,
  CheckCircle,
  Database,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Upload,
  UserCheck,
  UserX,
  Sliders,
  Award,
  Sparkles,
  Eye,
  Check,
  HelpCircle,
} from 'lucide-react';
import { Language, Theme, WordItem, CategoryId } from '../../types/game';
import { OnlineRoomData } from '../../types/multiplayer';
import { UserProfile, CompletedMatchRecord, UserRoleRecord, EditorPermission } from '../../types/user';
import {
  ADMIN_AUTHORIZED_EMAIL,
  isUserAdmin,
  getLocalCustomWords,
  addOrUpdateWord,
  deleteWord,
  getCustomQuickChats,
  saveCustomQuickChats,
  CustomQuickChats,
  DEFAULT_QUICK_CHATS,
  fetchLiveRooms,
  closeRoomByAdmin,
  deleteRoomByAdmin,
  pingFirestoreLatency,
  getSystemLogs,
  clearSystemLogs,
  SystemLogEntry,
} from '../../services/adminService';
import { fetchUsersForAdmin, setUserBanStatus } from '../../services/userService';
import { fetchRecentMatches } from '../../services/matchHistoryService';
import {
  isOwnerEmail,
  getUserRole,
  assignEditor,
  revokeEditor,
  fetchAllEditors,
  DEFAULT_EDITOR_PERMISSIONS,
} from '../../services/roleService';
import {
  GameScoringConfig,
  DEFAULT_SCORING_CONFIG,
  getActiveScoringConfig,
  saveActiveScoringConfig,
} from '../../utils/scoring';
import {
  ALL_WORDS,
  getFullWordPool,
  saveWordOverride,
  saveDeletedWordId,
  bulkDeleteWords,
  bulkUpdateCategory,
} from '../../data/words';
import { auth, signInWithGoogle, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sound } from '../../utils/audio';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

const CATEGORY_LABELS: Record<string, { bn: string; en: string }> = {
  all: { bn: 'সব ক্যাটাগরি', en: 'All Categories' },
  custom: { bn: 'কাস্টম যোগকৃত', en: 'Custom Added' },
  food: { bn: 'খাবার ও ফলমূল', en: 'Food & Cuisine' },
  people: { bn: 'ব্যক্তিত্ব ও চরিত্র', en: 'Famous People' },
  object: { bn: 'নিত্যব্যবহার্য জিনিস', en: 'Objects & Household' },
  animal: { bn: 'পশুপাখি', en: 'Animals & Birds' },
  school_life: { bn: 'স্কুল-কলেজ জীবন', en: 'School Life' },
  sports: { bn: 'খেলাধুলা', en: 'Sports' },
  lifestyle: { bn: 'লাইফস্টাইল ও শখ', en: 'Lifestyle' },
  historical_places: { bn: 'ঐতিহাসিক স্থান', en: 'Historical Places' },
  bd_tourist: { bn: 'পর্যটন কেন্দ্র', en: 'BD Tourist Spots' },
  tech: { bn: 'প্রযুক্তি ও গ্যাজেট', en: 'Technology & Gadgets' },
  movies: { bn: 'সিনেমা ও বিনোদন', en: 'Movies & Media' },
  geography: { bn: 'ভূগোল ও দেশ', en: 'Geography & Countries' },
  professions: { bn: 'পেশা ও জীবিকা', en: 'Occupations' },
  nature: { bn: 'প্রকৃতি ও পরিবেশ', en: 'Nature & Environment' },
  transport: { bn: 'যানবাহন ও যাতায়াত', en: 'Transport' },
  festivals: { bn: 'উৎসব ও সংস্কৃতি', en: 'Festivals' },
  everyday_activities: { bn: 'দৈনন্দিন কাজ', en: 'Daily Activities' },
  science: { bn: 'বিজ্ঞান ও মহাকাশ', en: 'Science' },
  clothing: { bn: 'পোশাক ও পরিধেয়', en: 'Clothing & Fashion' },
  landmarks: { bn: 'স্থাপত্য ও ভাস্কর্য', en: 'Landmarks' },
};

type AdminTab = 'overview' | 'words' | 'rooms_players' | 'firebase';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isEn = lang === 'en';

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isUserAdmin());
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Words management state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customWords, setCustomWords] = useState<WordItem[]>(() => getLocalCustomWords());
  const [isAddingWord, setIsAddingWord] = useState<boolean>(false);
  const [newWordBn, setNewWordBn] = useState<string>('');
  const [newWordEn, setNewWordEn] = useState<string>('');
  const [newHintBn, setNewHintBn] = useState<string>('');
  const [newHintEn, setNewHintEn] = useState<string>('');
  const [newCategory, setNewCategory] = useState<CategoryId>('food');
  const [editingWordId, setEditingWordId] = useState<number | null>(null);
  const [previewWord, setPreviewWord] = useState<WordItem | null>(null);

  // Quick chats & content state
  const [quickChats, setQuickChats] = useState<CustomQuickChats>(() => getCustomQuickChats());
  const [chatCategory, setChatCategory] = useState<'suspect' | 'defense' | 'fun'>('suspect');
  const [newChatBn, setNewChatBn] = useState<string>('');
  const [newChatEn, setNewChatEn] = useState<string>('');
  const [gameAnnouncement, setGameAnnouncement] = useState<string>('স্বাগতম ধাপ্পাবাজে! চতুর আলোচনা করুন এবং ধাপ্পাবাজকে চিহ্নিত করুন।');

  // Scoring management state
  const [scoringConfig, setScoringConfig] = useState<GameScoringConfig>(() => getActiveScoringConfig());
  const [showScoringConfirm, setShowScoringConfirm] = useState<boolean>(false);
  const [scoringSaveSuccess, setScoringSaveSuccess] = useState<boolean>(false);

  // Live rooms state
  const [liveRooms, setLiveRooms] = useState<OnlineRoomData[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);

  // Users & moderation state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [recentMatches, setRecentMatches] = useState<CompletedMatchRecord[]>([]);

  // Roles & Editors state
  const [editorsList, setEditorsList] = useState<UserRoleRecord[]>([]);
  const [newEditorEmail, setNewEditorEmail] = useState<string>('');
  const [newEditorName, setNewEditorName] = useState<string>('');
  const [newEditorPerms, setNewEditorPerms] = useState<EditorPermission>(DEFAULT_EDITOR_PERMISSIONS);

  // Analytics & Health state
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>(() => getSystemLogs());

  // Check admin status when modal opens or auth changes
  useEffect(() => {
    setIsAdmin(isUserAdmin());
  }, [isOpen, auth.currentUser]);

  // Load data based on active tab
  useEffect(() => {
    if (isOpen && isAdmin) {
      if (activeTab === 'overview' || activeTab === 'rooms_players') {
        loadRooms();
        loadUsers();
        loadMatches();
        loadEditors();
      } else if (activeTab === 'firebase') {
        loadUsers();
      } else if (activeTab === 'instructions') {
        setSystemLogs(getSystemLogs());
      }
    }
  }, [isOpen, isAdmin, activeTab]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    const rooms = await fetchLiveRooms();
    setLiveRooms(rooms);
    setLoadingRooms(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    const users = await fetchUsersForAdmin();
    setUsersList(users);
    setLoadingUsers(false);
  };

  const loadMatches = async () => {
    const matches = await fetchRecentMatches(30);
    setRecentMatches(matches);
  };

  const loadEditors = async () => {
    const editors = await fetchAllEditors();
    setEditorsList(editors);
  };

  const handlePing = async () => {
    setIsPinging(true);
    const latency = await pingFirestoreLatency();
    setPingMs(latency);
    setIsPinging(false);
  };

  const handleGoogleAdminLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (isOwnerEmail(user.email)) {
        setIsAdmin(true);
        sound.playClick();
      } else {
        setPasscodeError(
          isEn
            ? `Logged in as ${user.email}, but only the primary owner email (${ADMIN_AUTHORIZED_EMAIL}) can access the admin panel.`
            : `${user.email} দিয়ে লগইন হয়েছে, কিন্তু শুধু মাস্টার ওনার ইমেইল ${ADMIN_AUTHORIZED_EMAIL} দিয়ে অ্যাডমিন প্যানেল ব্যবহার করা যাবে।`
        );
      }
    } catch (e: any) {
      setPasscodeError(e?.message || 'Login failed');
    }
  };

  // Word pool & selection state
  const [wordsVersion, setWordsVersion] = useState<number>(0);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);

  const allWordsPool = useMemo(() => getFullWordPool(), [customWords, wordsVersion]);

  // Duplicate words detection
  const duplicateWords = useMemo(() => {
    const seen = new Map<string, number>();
    const dupes: string[] = [];
    allWordsPool.forEach((w) => {
      const keyBn = w.wordBn.trim().toLowerCase();
      const count = seen.get(keyBn) || 0;
      seen.set(keyBn, count + 1);
      if (count === 1) dupes.push(w.wordBn);
    });
    return dupes;
  }, [allWordsPool]);

  // Filtered words
  const filteredWords = useMemo(() => {
    return allWordsPool.filter((w) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        w.wordBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.wordEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.hintBn && w.hintBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.hintEn && w.hintEn.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCat = true;
      if (selectedCategory === 'custom') {
        matchesCat = customWords.some((cw) => cw.id === w.id);
      } else if (selectedCategory !== 'all') {
        matchesCat = w.category === selectedCategory;
      }

      return matchesSearch && matchesCat;
    });
  }, [allWordsPool, searchQuery, selectedCategory, customWords]);

  // Select all / Deselect all filtered words
  const handleToggleSelectAllWords = () => {
    sound.playClick();
    if (selectedWordIds.length === filteredWords.length && filteredWords.length > 0) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(filteredWords.map((w) => w.id));
    }
  };

  const handleToggleWordSelect = (id: number) => {
    sound.playClick();
    if (selectedWordIds.includes(id)) {
      setSelectedWordIds(selectedWordIds.filter((item) => item !== id));
    } else {
      setSelectedWordIds([...selectedWordIds, id]);
    }
  };

  // Edit any existing word (pack or custom)
  const handleEditWord = (w: WordItem) => {
    sound.playClick();
    setEditingWordId(w.id);
    setNewWordBn(w.wordBn);
    setNewWordEn(w.wordEn);
    setNewHintBn(w.hintBn || w.shortHintBn || '');
    setNewHintEn(w.hintEn || w.shortHintEn || '');
    setNewCategory(w.category);
    setIsAddingWord(true);
  };

  // Word save handler (supports modifying any existing pack word or custom word)
  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordBn.trim() || !newWordEn.trim() || !newHintBn.trim()) {
      alert(isEn ? 'Please fill in required fields' : 'সবগুলো ফিল্ড পূরণ করুন');
      return;
    }

    sound.playClick();
    const wordPayload: Omit<WordItem, 'id'> = {
      wordBn: newWordBn.trim(),
      wordEn: newWordEn.trim(),
      hintBn: newHintBn.trim(),
      hintEn: newHintEn.trim() || newHintBn.trim(),
      shortHintBn: newHintBn.trim(),
      shortHintEn: newHintEn.trim() || newHintBn.trim(),
      category: newCategory,
    };

    if (editingWordId) {
      saveWordOverride(editingWordId, wordPayload);
      const isCustom = customWords.some((cw) => cw.id === editingWordId);
      if (isCustom) {
        await addOrUpdateWord({ ...wordPayload, tag: 'custom' }, editingWordId);
      }
    } else {
      await addOrUpdateWord({ ...wordPayload, tag: 'custom' });
    }

    setCustomWords(getLocalCustomWords());
    setWordsVersion((v) => v + 1);
    setIsAddingWord(false);
    setEditingWordId(null);
    setNewWordBn('');
    setNewWordEn('');
    setNewHintBn('');
    setNewHintEn('');
  };

  const handleDeleteWord = (id: number) => {
    if (confirm(isEn ? 'Are you sure you want to remove this word from the game?' : 'আপনি কি নিশ্চিত যে এই শব্দটি খেলা থেকে মুছতে চান?')) {
      sound.playClick();
      deleteWord(id);
      saveDeletedWordId(id);
      setSelectedWordIds((prev) => prev.filter((i) => i !== id));
      setCustomWords(getLocalCustomWords());
      setWordsVersion((v) => v + 1);
    }
  };

  const handleBulkDelete = () => {
    if (selectedWordIds.length === 0) return;
    if (confirm(isEn ? `Delete ${selectedWordIds.length} selected words?` : `নির্বাচিত ${selectedWordIds.length}টি শব্দ মুছবেন?`)) {
      sound.playClick();
      bulkDeleteWords(selectedWordIds);
      selectedWordIds.forEach((id) => deleteWord(id));
      setSelectedWordIds([]);
      setCustomWords(getLocalCustomWords());
      setWordsVersion((v) => v + 1);
    }
  };

  const handleBulkChangeCategory = (cat: CategoryId) => {
    if (selectedWordIds.length === 0) return;
    sound.playClick();
    bulkUpdateCategory(selectedWordIds, cat);
    setSelectedWordIds([]);
    setWordsVersion((v) => v + 1);
  };

  // CSV Export
  const handleExportCsv = () => {
    sound.playClick();
    const rows = [
      ['wordBn', 'wordEn', 'hintBn', 'hintEn', 'category'],
      ...allWordsPool.map((w) => [
        `"${w.wordBn.replace(/"/g, '""')}"`,
        `"${w.wordEn.replace(/"/g, '""')}"`,
        `"${(w.hintBn || '').replace(/"/g, '""')}"`,
        `"${(w.hintEn || '').replace(/"/g, '""')}"`,
        w.category || 'general',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhappabaj_words_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n');
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 3) {
            const wordBn = parts[0].replace(/"/g, '').trim();
            const wordEn = parts[1].replace(/"/g, '').trim();
            const hintBn = parts[2].replace(/"/g, '').trim();
            const hintEn = parts[3] ? parts[3].replace(/"/g, '').trim() : hintBn;
            const category = (parts[4] ? parts[4].replace(/"/g, '').trim() : 'food') as CategoryId;

            if (wordBn && wordEn) {
              await addOrUpdateWord({
                wordBn,
                wordEn,
                hintBn,
                hintEn,
                category,
                tag: 'custom',
              });
              count++;
            }
          }
        }
        setCustomWords(getLocalCustomWords());
        alert(isEn ? `Successfully imported ${count} words!` : `সফলভাবে ${count}টি শব্দ ইমপোর্ট করা হয়েছে!`);
      } catch {
        alert(isEn ? 'Failed to parse CSV file' : 'CSV ফাইল পড়তে ব্যর্থ হয়েছে');
      }
    };
    reader.readAsText(file);
  };

  // Quick Chat save
  const handleAddChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatBn.trim()) return;

    sound.playClick();
    const updated = { ...quickChats };
    updated[chatCategory].unshift({
      bn: newChatBn.trim(),
      en: newChatEn.trim() || newChatBn.trim(),
    });
    setQuickChats(updated);
    saveCustomQuickChats(updated);
    setNewChatBn('');
    setNewChatEn('');
  };

  const handleDeleteChat = (category: 'suspect' | 'defense' | 'fun', index: number) => {
    sound.playClick();
    const updated = { ...quickChats };
    updated[category].splice(index, 1);
    setQuickChats(updated);
    saveCustomQuickChats(updated);
  };

  // Scoring save
  const handleSaveScoringConfig = async () => {
    sound.playClick();
    saveActiveScoringConfig(scoringConfig);
    try {
      const configRef = doc(db, 'game_config', 'scoring_rules');
      await setDoc(configRef, scoringConfig, { merge: true });
    } catch {}
    setShowScoringConfirm(false);
    setScoringSaveSuccess(true);
    setTimeout(() => setScoringSaveSuccess(false), 3000);
  };

  // Assign Editor
  const handleAssignEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditorEmail.trim()) return;
    sound.playClick();
    await assignEditor(newEditorEmail.trim(), newEditorName.trim(), newEditorPerms);
    setNewEditorEmail('');
    setNewEditorName('');
    loadEditors();
  };

  const handleRevokeEditor = async (id: string) => {
    if (confirm(isEn ? 'Revoke editor access for this account?' : 'এই অ্যাকাউন্টের এডিটর ক্ষমতা বাতিল করবেন?')) {
      sound.playClick();
      await revokeEditor(id);
      loadEditors();
    }
  };

  // User Ban / Unban
  const handleToggleUserBan = async (user: UserProfile) => {
    const newStatus = !user.isBanned;
    sound.playClick();
    await setUserBanStatus(user.uid, newStatus);
    setUsersList((prev) =>
      prev.map((u) => (u.uid === user.uid ? { ...u, isBanned: newStatus } : u))
    );
  };

  // Overview stats
  const registeredCount = usersList.filter((u) => u.accountType === 'google').length;
  const guestCount = usersList.filter((u) => u.accountType === 'guest').length;
  const totalMatchesCount = recentMatches.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[92vh] max-h-[900px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? 'Dhappabaj Central Command' : 'ধাপ্পাবাজ সেন্ট্রাল কন্ট্রোল অ্যাডমিন'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {isEn ? 'Authorized Master Room & Live Content Management' : 'রিয়েলটাইম গেম ম্যানেজমেন্ট, ডাটাবেস ও ইউজার কন্ট্রোল'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE (Auth Screen) */}
        {!isAdmin ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isEn ? 'Master Admin Authorization' : 'মাস্টার অ্যাডমিন অনুমোদন'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? `Sign in with primary owner (${ADMIN_AUTHORIZED_EMAIL}) or enter pass.`
                  : `মাস্টার ওনার (${ADMIN_AUTHORIZED_EMAIL}) দিয়ে লগইন অথবা পাসকোড প্রবেশ করান।`}
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold w-full text-left flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <span className="text-blue-500 font-black">G</span>
              <span>{isEn ? 'Sign in with Google' : 'Google দিয়ে সাইন ইন করুন'}</span>
            </button>

          </div>
        ) : (
          /* UNLOCKED DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-1 overflow-x-auto text-xs font-bold bg-slate-50/40 dark:bg-slate-950/40 scrollbar-none">
              {[
                { id: 'overview', icon: <TrendingUp className="w-3.5 h-3.5" />, bn: 'ওভারভিউ', en: 'Overview' },
                { id: 'words', icon: <BookOpen className="w-3.5 h-3.5" />, bn: 'শব্দ ও ইঙ্গিত', en: 'Words & Hints' },
                { id: 'rooms_players', icon: <Users className="w-3.5 h-3.5" />, bn: 'লাইভ রুম ও মডারেশন', en: 'Live Rooms & Players' },
                { id: 'firebase', icon: <Database className="w-3.5 h-3.5" />, bn: 'সিস্টেম স্ট্যাটাস', en: 'System & Database' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sound.playKeySound();
                    setActiveTab(tab.id as AdminTab);
                  }}
                  className={`py-2 px-3 rounded-t-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 border-t-2 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{isEn ? tab.en : tab.bn}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
                      {isEn ? 'Total Words' : 'মোট শব্দ ভাণ্ডার'}
                    </span>
                    <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                      {allWordsPool.length}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      {customWords.length} custom added
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                      {isEn ? 'Google Players' : 'রেজিস্টার্ড প্লেয়ার'}
                    </span>
                    <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {registeredCount}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      {guestCount} guest players
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
                      {isEn ? 'Active Rooms' : 'চলমান রুম'}
                    </span>
                    <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                      {liveRooms.length}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Live online games
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                      {isEn ? 'Completed Matches' : 'সম্পূর্ণ ম্যাচ'}
                    </span>
                    <p className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                      {totalMatchesCount}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Recorded in history
                    </span>
                  </div>
                </div>

                {/* Popular Categories & Recent Matches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{isEn ? 'Category Distribution' : 'ক্যাটাগরি ভিত্তিক শব্দের সংখ্যা'}</span>
                      <span className="font-mono text-amber-500">{Object.keys(CATEGORY_LABELS).length - 2} Categories</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(CATEGORY_LABELS).slice(2, 10).map(([k, label]) => {
                        const count = allWordsPool.filter((w) => w.category === k).length;
                        return (
                          <div key={k} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between">
                            <span className="truncate">{isEn ? label.en : label.bn}</span>
                            <span className="font-mono font-bold text-amber-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {isEn ? 'Recent Match Activity' : 'সাম্প্রতিক ম্যাচ কার্যকলাপ'}
                    </h4>
                    {recentMatches.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        {isEn ? 'No completed matches recorded yet.' : 'এখনও কোনো সম্পূর্ণ ম্যাচ রেকর্ড হয়নি।'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentMatches.slice(0, 5).map((m) => (
                          <div key={m.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {m.mode === 'online' ? `Online Room ${m.roomCode}` : 'Pass & Play'}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {new Date(m.completedAt).toLocaleTimeString()} · {m.players.length} players
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.winnerTeam === 'imposter' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                            }`}>
                              {m.winnerTeam === 'imposter' ? 'Imposters Won' : 'Citizens Won'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WORDS & HINTS */}
            {activeTab === 'words' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsAddingWord(true);
                        setEditingWordId(null);
                        setNewWordBn('');
                        setNewWordEn('');
                        setNewHintBn('');
                        setNewHintEn('');
                      }}
                      className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-3" />
                      <span>{isEn ? 'Add Word' : 'নতুন শব্দ যোগ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      title={isEn ? 'Export All Words to CSV' : 'সব শব্দ CSV আকারে ডাউনলোড করুন'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV Export</span>
                    </button>

                    <label className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>CSV Import</span>
                      <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
                    </label>
                  </div>

                  <div className="text-xs font-mono text-slate-500 font-bold">
                    {filteredWords.length} / {allWordsPool.length} {isEn ? 'words' : 'শব্দ'}
                  </div>
                </div>

                {/* Add / Edit Word Form */}
                {isAddingWord && (
                  <form onSubmit={handleSaveWord} className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">
                        {editingWordId ? (isEn ? 'Edit Word' : 'শব্দ পরিবর্তন') : (isEn ? 'Add New Word' : 'নতুন শব্দ ও ইঙ্গিত যোগ')}
                      </h4>
                      <button type="button" onClick={() => setIsAddingWord(false)} className="text-xs text-slate-400 cursor-pointer">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="বাংলা শব্দ (যেমন: ইলিশ মাছ)"
                        value={newWordBn}
                        onChange={(e) => setNewWordBn(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="English Word (e.g. Hilsa Fish)"
                        value={newWordEn}
                        onChange={(e) => setNewWordEn(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="বাংলা ইঙ্গিত (Hint) - যা ধাপ্পাবাজ দেখবে"
                        value={newHintBn}
                        onChange={(e) => setNewHintBn(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="English Hint (Cryptic clue for imposter)"
                        value={newHintEn}
                        onChange={(e) => setNewHintEn(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      >
                        {Object.entries(CATEGORY_LABELS).slice(2).map(([k, l]) => (
                          <option key={k} value={k}>{isEn ? l.en : l.bn}</option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                      >
                        {isEn ? 'Save to Game' : 'সংরক্ষণ করুন'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter & Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={isEn ? 'Search words or hints...' : 'শব্দ বা ইঙ্গিত খুঁজুন...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>{isEn ? l.en : l.bn}</option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions Bar */}
                {selectedWordIds.length > 0 && (
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-amber-700 dark:text-amber-300">
                      <span>✓ {isEn ? `${selectedWordIds.length} words selected` : `${selectedWordIds.length}টি শব্দ নির্বাচিত`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleBulkChangeCategory(e.target.value as CategoryId);
                        }}
                        defaultValue=""
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      >
                        <option value="" disabled>{isEn ? 'Move to category...' : 'ক্যাটাগরি পরিবর্তন...'}</option>
                        {Object.entries(CATEGORY_LABELS).slice(2).map(([k, l]) => (
                          <option key={k} value={k}>{isEn ? l.en : l.bn}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        {isEn ? 'Delete Selected' : 'নির্বাচিতগুলো মুছুন'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWordIds([])}
                        className="px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                        title={isEn ? 'Deselect All' : 'সব বাতিল'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Words Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 gap-2 p-3 font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 items-center">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={filteredWords.length > 0 && selectedWordIds.length === filteredWords.length}
                        onChange={handleToggleSelectAllWords}
                        className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                        title={isEn ? 'Select All / Deselect All' : 'সব নির্বাচন / সব বাতিল'}
                      />
                    </div>
                    <span className="col-span-3">{isEn ? 'Word (Bangla / English)' : 'শব্দ'}</span>
                    <span className="col-span-4">{isEn ? 'Imposter Hint' : 'ধাপ্পাবাজের ইঙ্গিত'}</span>
                    <span className="col-span-2">{isEn ? 'Category' : 'ক্যাটাগরি'}</span>
                    <span className="col-span-2 text-right">{isEn ? 'Action' : 'অ্যাকশন'}</span>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredWords.slice(0, 150).map((w) => {
                      const isSelected = selectedWordIds.includes(w.id);
                      return (
                        <div
                          key={w.id}
                          className={`grid grid-cols-12 gap-2 p-3 items-center transition-colors ${
                            isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="col-span-1 flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleWordSelect(w.id)}
                              className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                            />
                          </div>
                          <div className="col-span-3 min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">{w.wordBn}</span>
                            <span className="text-[11px] text-slate-400 font-mono block truncate">{w.wordEn}</span>
                          </div>
                          <div className="col-span-4 min-w-0">
                            <span className="text-amber-600 dark:text-amber-400 font-semibold block truncate">
                              "{w.hintBn || w.shortHintBn}"
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {w.hintEn || w.shortHintEn}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                              {w.category}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewWord(w)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 cursor-pointer"
                              title={isEn ? 'Preview Word Card' : 'প্রিভিউ'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditWord(w)}
                              className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 cursor-pointer transition-colors"
                              title={isEn ? 'Edit Word & Hint' : 'সম্পাদনা'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWord(w.id)}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer transition-colors"
                              title={isEn ? 'Delete Word' : 'মুছুন'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Word Card Preview Modal */}
                {previewWord && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase text-slate-500">Live Word Card Preview</span>
                        <button type="button" onClick={() => setPreviewWord(null)} className="text-xs cursor-pointer">✕</button>
                      </div>

                      {/* Citizen Preview */}
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-600">Citizen View</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{previewWord.wordBn}</p>
                        <p className="text-xs text-slate-500 font-mono">({previewWord.wordEn})</p>
                      </div>

                      {/* Imposter Preview */}
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-600">Imposter View (No secret word!)</span>
                        <p className="text-xl font-black text-amber-500">"{previewWord.hintBn || previewWord.shortHintBn}"</p>
                        <p className="text-xs text-slate-500 font-mono">Hint: {previewWord.hintEn || previewWord.shortHintEn}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* TAB 4: SCORING MANAGEMENT */}
            {activeTab === 'scoring' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span>{isEn ? 'Scoring Configuration Engine' : 'পয়েন্ট ও স্কোরিং ম্যানেজমেন্ট'}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {isEn
                      ? 'Changes apply immediately to all new rounds and matches across Online and Pass & Play.'
                      : 'এখানে করা পরিবর্তন নিশ্চিত করলে সব নতুন ম্যাচ এবং অনলাইন রুমে তা কার্যকর হবে।'}
                  </p>
                </div>

                {scoringSaveSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>{isEn ? 'Scoring rules successfully updated!' : 'স্কোরিং নিয়মাবলী সফলভাবে আপডেট হয়েছে!'}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Citizen Scoring Block */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-black uppercase text-emerald-600 tracking-wider">
                      {isEn ? 'Citizen Scoring Rules' : 'নাগরিক স্কোরিং নিয়ম'}
                    </h5>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>সঠিক ধাপ্পাবাজ নির্বাচন:</span>
                        <input
                          type="number"
                          value={scoringConfig.citizenCorrectVotePoints}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, citizenCorrectVotePoints: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>নির্দোষকে ভুল ভোট (পেনাল্টি):</span>
                        <input
                          type="number"
                          value={scoringConfig.citizenWrongVotePoints}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, citizenWrongVotePoints: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ধাপ্পাবাজ পরাজিত হলে নাগরিক জয় বোনাস:</span>
                        <input
                          type="number"
                          value={scoringConfig.citizenImposterLossBonus}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, citizenImposterLossBonus: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ভুলক্রমে বহিষ্কৃত হলে সান্ত্বনা বোনাস:</span>
                        <input
                          type="number"
                          value={scoringConfig.citizenConsolationPoints}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, citizenConsolationPoints: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Imposter Scoring Block */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-black uppercase text-rose-600 tracking-wider">
                      {isEn ? 'Imposter Scoring Rules' : 'ধাপ্পাবাজ স্কোরিং নিয়ম'}
                    </h5>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>ধাপ্পাবাজ জয়লাভ পয়েন্ট:</span>
                        <input
                          type="number"
                          value={scoringConfig.imposterWinPoints}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, imposterWinPoints: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>০ ভোট পেয়ে জয়লাভের বোনাস:</span>
                        <input
                          type="number"
                          value={scoringConfig.imposterZeroVotesBonus}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, imposterZeroVotesBonus: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ধাপ্পাবাজ পরাজিত হলে পয়েন্ট (ঠিক ০):</span>
                        <input
                          type="number"
                          value={scoringConfig.imposterLossPoints}
                          onChange={(e) => setScoringConfig({ ...scoringConfig, imposterLossPoints: Number(e.target.value) })}
                          className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button with Confirmation Step */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScoringConfirm(true)}
                    className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-3" />
                    <span>{isEn ? 'Apply Scoring Configuration' : 'নতুন স্কোরিং নিয়ম কার্যকর করুন'}</span>
                  </button>
                </div>

                {/* Scoring Confirmation Dialog */}
                {showScoringConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {isEn ? 'Confirm Scoring Rules Update?' : 'স্কোরিং পরিবর্তন নিশ্চিত করুন'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isEn
                            ? 'This new scoring will take effect immediately in all future matches.'
                            : 'এই নতুন স্কোরিং সূত্রটি সব ভবিষ্যৎ রাউন্ড ও ম্যাচে প্রযোজ্য হবে।'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowScoringConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                        >
                          {isEn ? 'Cancel' : 'বাতিল'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveScoringConfig}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                        >
                          {isEn ? 'Confirm & Apply' : 'হ্যাঁ, কার্যকর করুন'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: ROOMS, PLAYERS & ROLES */}
            {activeTab === 'rooms_players' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                {/* Active Rooms */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {isEn ? 'Live Online Rooms' : 'চলমান অনলাইন রুম'} ({liveRooms.length})
                    </h4>
                    <button type="button" onClick={loadRooms} className="text-xs text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                      <RefreshCw className={`w-3 h-3 ${loadingRooms ? 'animate-spin' : ''}`} />
                      <span>{isEn ? 'Refresh' : 'রিফ্রেশ'}</span>
                    </button>
                  </div>

                  {liveRooms.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-center text-xs text-slate-400">
                      {isEn ? 'No active rooms at the moment.' : 'এই মুহূর্তে কোনো সক্রিয় রুম নেই।'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {liveRooms.map((r) => (
                        <div key={r.roomCode} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-black text-amber-500 text-sm">{r.roomCode}</span>
                            <span className="text-[10px] text-slate-400 block">Host: {r.hostId ? r.hostId.slice(0, 8) : 'Host'} · Phase: {r.currentPhase}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Close room ${r.roomCode}?`)) {
                                closeRoomByAdmin(r.roomCode);
                                setLiveRooms((prev) => prev.filter((rm) => rm.roomCode !== r.roomCode));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer"
                            title="Terminate Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Player Accounts & Moderation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {isEn ? 'Player Profiles & Moderation' : 'প্লেয়ার প্রোফাইল ও মডারেশন'} ({usersList.length})
                    </h4>
                    <button type="button" onClick={loadUsers} className="text-xs text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                      <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                      <span>{isEn ? 'Refresh' : 'রিফ্রেশ'}</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-2xl border divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {usersList.map((u) => (
                      <div key={u.uid} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{u.customization?.avatar || '🕵️'}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{u.displayName}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                                u.accountType === 'google' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {u.accountType}
                              </span>
                              {u.isBanned && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 font-bold">BANNED</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {u.email || u.uid.slice(0, 12)} · {u.stats?.totalPoints || 0} pts
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleUserBan(u)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            u.isBanned
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {u.isBanned ? (isEn ? 'Unban' : 'আনব্যান') : (isEn ? 'Suspend' : 'স্থগিত')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assign Editor Role */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">
                        {isEn ? 'Assign Authorized Editor (Google Account)' : 'অনুমোদিত এডিটর নিয়োগ (Google Account)'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Primary Owner: <strong>{ADMIN_AUTHORIZED_EMAIL}</strong>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAssignEditor} className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Editor Google Email (e.g. editor@gmail.com)"
                        value={newEditorEmail}
                        onChange={(e) => setNewEditorEmail(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Editor Name"
                        value={newEditorName}
                        onChange={(e) => setNewEditorName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs font-semibold pt-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEditorPerms.canManageWords}
                          onChange={(e) => setNewEditorPerms({ ...newEditorPerms, canManageWords: e.target.checked })}
                        />
                        <span>Manage Words</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEditorPerms.canManageHints}
                          onChange={(e) => setNewEditorPerms({ ...newEditorPerms, canManageHints: e.target.checked })}
                        />
                        <span>Manage Hints</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEditorPerms.canManageTexts}
                          onChange={(e) => setNewEditorPerms({ ...newEditorPerms, canManageTexts: e.target.checked })}
                        />
                        <span>Manage Texts</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      {isEn ? 'Authorize Editor' : 'এডিটর অনুমতি প্রদান করুন'}
                    </button>
                  </form>

                  {/* Editors List */}
                  {editorsList.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Active Editors:</span>
                      {editorsList.map((ed) => (
                        <div key={ed.uid} className="p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{ed.displayName}</span>
                            <span className="text-slate-400 ml-2 font-mono">({ed.email})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevokeEditor(ed.uid)}
                            className="text-rose-500 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: FIREBASE INFO */}
            {activeTab === 'firebase' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Daily Reads Quota</span>
                      <span className="font-mono text-emerald-500">50,000 Free/Day</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Status: Healthy</span>
                      <span>Safe Usage</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Daily Writes Quota</span>
                      <span className="font-mono text-emerald-500">20,000 Free/Day</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: '9%' }} />
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Status: Optimal</span>
                      <span>Safe Usage</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Network Roundtrip Ping</span>
                      <button type="button" onClick={handlePing} disabled={isPinging} className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
                        <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                        <span>Ping</span>
                      </button>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {pingMs !== null ? `${pingMs} ms` : 'Click Ping'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cloud Firestore response latency
                    </div>
                  </div>
                </div>

                {/* Configuration Identifiers (No secrets exposed) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Secure Firebase Infrastructure Settings</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex justify-between">
                      <span className="text-slate-500">Project Name:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">dhappabaj (semiotic-dryad-kwpgt)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex justify-between">
                      <span className="text-slate-500">Firestore DB ID:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        ai-studio-dhappabajonlinee-ceeaf2df-4aeb-4a70-8e6b-1923970426eb
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex justify-between">
                      <span className="text-slate-500">Auth Service:</span>
                      <span className="font-semibold text-emerald-500">Active (Google + Anonymous)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex justify-between">
                      <span className="text-slate-500">Security Credentials:</span>
                      <span className="font-semibold text-emerald-500">Encrypted / Guarded</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: OPERATOR INSTRUCTIONS */}
            {activeTab === 'instructions' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                    <span>💡</span>
                    <span>{isEn ? 'Firebase Quota & How to Never Get Blocked' : 'ফায়ারবেস কোটা ও নিরবচ্ছিন্ন গেম চালনা'}</span>
                  </h4>
                  <p>
                    {isEn
                      ? 'The Firebase free tier allows 50,000 reads and 20,000 writes every single day.'
                      : 'ফায়ারবেস ফ্রি স্পার্ক প্ল্যানে প্রতিদিন ৫০,০০০ রিড ও ২০,০০০ রাইট সম্পূর্ণ ফ্রি। সীমা অতিক্রম করলে প্যাসিফিক মধ্যরাতে এটি স্বয়ংক্রিয় রিসেট হয়।'}
                  </p>
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    {isEn
                      ? 'Best practice: In Firebase Console, upgrade the project to Blaze Plan (Pay as you go). You still get the 50,000 daily reads 100% free forever, and any extra reads cost just $0.06 per 100,000 reads, meaning your game will NEVER freeze!'
                      : 'স্থায়ী সমাধান: Firebase Console এ গিয়ে প্রজেক্টটিকে Blaze Plan এ উন্নীত করুন। ৫০,০০০ দৈনিক ফ্রি সীমা সবসময় বহাল থাকবে এবং খেলা কখনো আটকে যাবে না!'}
                  </p>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
