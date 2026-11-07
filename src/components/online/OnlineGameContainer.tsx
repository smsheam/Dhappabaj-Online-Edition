import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  DoorOpen,
  LogOut,
  RefreshCw,
  Sparkles,
  WifiOff,
  Home,
  PlusCircle,
  Music,
  VolumeX,
  BarChart2,
  BookOpen,
  Award,
  CheckCircle,
  ShieldCheck,
  UserX,
  X,
  Trophy,
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import {
  OnlinePlayer,
  OnlineRoomData,
  PrivatePlayerRole,
  OnlineVote,
  RoomClosedReason,
  OnlineGamePhase,
} from '../../types/multiplayer';
import {
  subscribeToOnlineRoom,
  subscribeToOnlinePlayers,
  subscribeToOnlinePrivateRole,
  subscribeToOnlineVotes,
  sendPlayerHeartbeat,
  setHostDisconnected,
  checkAndExpireRoomIfNeeded,
  leaveOnlineRoom,
  HOST_DISCONNECT_GRACE_MS,
} from '../../services/multiplayerService';
import { OnlineLobbyScreen } from './OnlineLobbyScreen';
import { OnlineRoleRevealScreen } from './OnlineRoleRevealScreen';
import { OnlineClueScreen } from './OnlineClueScreen';
import { OnlineDiscussionScreen } from './OnlineDiscussionScreen';
import { OnlineVotingScreen } from './OnlineVotingScreen';
import { OnlineImposterGuessScreen } from './OnlineImposterGuessScreen';
import { OnlineResultScreen } from './OnlineResultScreen';
import { OnlineScoreboardScreen } from './OnlineScoreboardScreen';
import { OnlineGameOverScreen } from './OnlineGameOverScreen';
import { auth } from '../../firebase';
import { sound } from '../../utils/audio';

interface OnlineGameContainerProps {
  initialRoom: OnlineRoomData;
  initialPlayer: OnlinePlayer;
  lang: Language;
  theme: Theme;
  onExit: () => void;
  onReopenOnlineModal?: () => void;
  onOpenAdmin?: () => void;
}

export const OnlineGameContainer: React.FC<OnlineGameContainerProps> = ({
  initialRoom,
  initialPlayer,
  lang,
  theme,
  onExit,
  onReopenOnlineModal,
  onOpenAdmin,
}) => {
  const isEn = lang === 'en';
  const [room, setRoom] = useState<OnlineRoomData>(initialRoom);
  const [players, setPlayers] = useState<OnlinePlayer[]>([initialPlayer]);
  const [privateRole, setPrivateRole] = useState<PrivatePlayerRole | null>(null);
  const [votes, setVotes] = useState<OnlineVote[]>([]);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [closedReason, setClosedReason] = useState<RoomClosedReason>(null);
  const [isConfirmingExit, setIsConfirmingExit] = useState<boolean>(false);

  // Requirement 10: Background Music (BGM)
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(true);

  // Requirement 6: Persistent Score & Rule Drawer
  const [isScoreRulesOpen, setIsScoreRulesOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'scores' | 'rules'>('scores');

  // Host disconnect countdown tracker (30 seconds)
  const [hostDisconnectSecondsLeft, setHostDisconnectSecondsLeft] = useState<number | null>(null);

  const currentUserId = auth.currentUser?.uid || initialPlayer.id;
  const isHost = room.hostId === currentUserId;

  const roomStateRef = React.useRef<OnlineRoomData>(initialRoom);
  const hasSeenSelfInRoomRef = React.useRef<boolean>(false);
  const playersStateRef = React.useRef<OnlinePlayer[]>([initialPlayer]);

  useEffect(() => {
    roomStateRef.current = room;
  }, [room]);

  useEffect(() => {
    playersStateRef.current = players;
  }, [players]);

  // Requirement 10: Auto-start procedural background music on match entry
  useEffect(() => {
    sound.startBackgroundMusic();
    setIsBgmPlaying(sound.isBgmPlaying());

    const handleFirstUserInteraction = () => {
      sound.startBackgroundMusic();
      setIsBgmPlaying(true);
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);

    return () => {
      sound.stopBackgroundMusic();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  const handleToggleBgm = () => {
    const active = sound.toggleBackgroundMusic();
    setIsBgmPlaying(active);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubRoom = subscribeToOnlineRoom(
      initialRoom.roomCode,
      (updatedRoom) => {
        if (!updatedRoom) {
          // Room document was deleted
          setClosedReason('empty_room');
          setRoomClosed(true);
        } else {
          setRoom(updatedRoom);

          // Check if room was closed or expired by host or backend
          const isClosed =
            updatedRoom.status === 'CLOSED' ||
            updatedRoom.status === 'EXPIRED' ||
            (updatedRoom.status as string) === 'closed' ||
            (updatedRoom.status as string) === 'expired' ||
            (updatedRoom.status as string) === 'ended';

          if (isClosed) {
            setClosedReason(updatedRoom.closedReason || (updatedRoom.status === 'EXPIRED' ? 'inactivity_timeout' : 'host_left'));
            setRoomClosed(true);
          }
        }
      },
      (err) => console.error('Room subscription error:', err)
    );

    const unsubPlayers = subscribeToOnlinePlayers(
      initialRoom.roomCode,
      (updatedPlayers) => {
        setPlayers(updatedPlayers);
        // Check if current user is confirmed in the players list
        const stillInRoom = updatedPlayers.some((p) => p.id === currentUserId);
        if (stillInRoom) {
          hasSeenSelfInRoomRef.current = true;
        } else if (hasSeenSelfInRoomRef.current && updatedPlayers.length > 0) {
          // Only trigger left if user was previously seen in the room and then removed
          setClosedReason('host_left');
          setRoomClosed(true);
        }
      },
      (err) => console.error('Players subscription error:', err)
    );

    const unsubPrivate = subscribeToOnlinePrivateRole(
      initialRoom.roomCode,
      currentUserId,
      (roleData) => {
        setPrivateRole(roleData);
      },
      (err) => console.error('Private role subscription error:', err)
    );

    const unsubVotes = subscribeToOnlineVotes(
      initialRoom.roomCode,
      (updatedVotes) => {
        setVotes(updatedVotes);
      },
      (err) => console.error('Votes subscription error:', err)
    );

    // Heartbeat every 120 seconds to reduce Firestore writes and listener fan-out
    const heartbeatInterval = setInterval(async () => {
      const myPlayer = playersStateRef.current.find((p) => p.id === currentUserId);
      if (myPlayer) {
        await sendPlayerHeartbeat(initialRoom.roomCode, isHost, myPlayer.name, myPlayer.avatar, playersStateRef.current.length);
      }
      // Any connected room member can trigger expiry after the configured inactivity window.
      await checkAndExpireRoomIfNeeded(initialRoom.roomCode, roomStateRef.current);
    }, 120000);

    // Window beforeunload listener for intentional tab close
    const handleBeforeUnload = () => {
      if (isHost && roomStateRef.current.status === 'PLAYING') {
        setHostDisconnected(initialRoom.roomCode, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubPrivate();
      unsubVotes();
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initialRoom.roomCode, currentUserId, isHost]);

  // Host disconnect countdown tracker (30 seconds)
  useEffect(() => {
    if (!room.hostDisconnectedAt || isHost) {
      setHostDisconnectSecondsLeft(null);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - (room.hostDisconnectedAt || 0);
      const remaining = Math.max(0, Math.ceil((HOST_DISCONNECT_GRACE_MS - elapsed) / 1000));
      setHostDisconnectSecondsLeft(remaining);

      if (remaining <= 0) {
        checkAndExpireRoomIfNeeded(room.roomCode, room);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room.hostDisconnectedAt, room.roomCode, isHost, room]);

  const handleConfirmExit = async () => {
    sound.playClick();
    setIsConfirmingExit(false);
    await leaveOnlineRoom(room.roomCode);
    onExit();
  };

  const handleReturnToMenu = () => {
    sound.playClick();
    sessionStorage.removeItem('dhappabaj_active_room');
    onExit();
  };

  const handleJoinAnotherRoom = () => {
    sound.playClick();
    sessionStorage.removeItem('dhappabaj_active_room');
    onExit();
    if (onReopenOnlineModal) {
      onReopenOnlineModal();
    }
  };

  // ROOM CLOSED OR EXPIRED SCREEN
  if (roomClosed) {
    const isExpired =
      closedReason === 'inactivity_timeout' ||
      room.status === 'EXPIRED' ||
      (room.status as string) === 'expired';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl shadow-inner">
            {isExpired ? '⏱️' : closedReason === 'host_disconnected' ? '⚡' : '🚪'}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isExpired
                ? isEn
                  ? 'Room Expired Due to Inactivity'
                  : 'নিষ্ক্রিয়তার কারণে রুমের মেয়াদ শেষ'
                : closedReason === 'host_disconnected'
                ? isEn
                  ? 'Host Disconnected'
                  : 'হোস্টের সংযোগ বিচ্ছিন্ন হয়েছে'
                : isEn
                ? 'Room Closed'
                : 'রুমটি বন্ধ হয়েছে'}
            </h2>

            {/* Exact required Bengali error message */}
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              {isExpired
                ? 'এই রুমটি আর চালু নেই। নতুন একটি রুমে যোগ দিন।'
                : closedReason === 'host_left'
                ? isEn
                  ? 'The host left the game, so the room has been closed.'
                  : 'হোস্ট রুম ত্যাগ করায় রুমটি বন্ধ হয়ে গেছে। নতুন একটি রুমে যোগ দিন।'
                : closedReason === 'host_disconnected'
                ? isEn
                  ? 'The room was closed because the host did not reconnect within 30 seconds.'
                  : 'হোস্ট ৩০ সেকেন্ডের মধ্যে পুনরায় সংযুক্ত না হওয়ায় রুমটি বন্ধ হয়ে গেছে।'
                : isEn
                ? 'This room is no longer active. Please join a new room.'
                : 'এই রুমটি আর চালু নেই। নতুন একটি রুমে যোগ দিন।'}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleJoinAnotherRoom}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isEn ? 'Join / Create Another Room' : 'অন্য রুমে যোগ দিন / তৈরি করুন'}</span>
            </button>

            <button
              type="button"
              onClick={handleReturnToMenu}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isEn ? 'Return to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find((p) => p.id === currentUserId) || initialPlayer;

  return (
    <div className="relative min-h-screen">
      {/* Host Disconnect Grace Period Banner */}
      {hostDisconnectSecondsLeft !== null && hostDisconnectSecondsLeft > 0 && !currentPlayer.isHost && (
        <div className="sticky top-0 z-50 bg-rose-500 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md animate-pulse">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {isEn
              ? `Host disconnected! Waiting for reconnection... (${hostDisconnectSecondsLeft}s)`
              : `হোস্টের সংযোগ বিচ্ছিন্ন হয়েছে... পুনরায় সংযোগের অপেক্ষা করা হচ্ছে (${hostDisconnectSecondsLeft} সেকেন্ড)`}
          </span>
        </div>
      )}

      {/* Requirement 6 & 10: Persistent Floating Status Bar during all active phases */}
      {room.currentPhase !== 'LOBBY' && (
        <div className="fixed top-2 inset-x-2 sm:inset-x-6 z-40 flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg text-xs transition-all">
          {/* Left: Player Profile & Live Score */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${currentPlayer.avatarColor || 'bg-amber-500'} flex items-center justify-center text-sm shrink-0`}>
              {currentPlayer.avatar || '🕵️'}
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate hidden xs:inline max-w-[80px]">
                {currentPlayer.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-black text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <span>⭐</span>
                <span>{currentPlayer.score}</span>
                <span className="text-[9px] font-normal">{isEn ? 'pts' : 'পয়েন্ট'}</span>
              </span>
            </div>
          </div>

          {/* Center: Match Round */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 font-bold text-[11px] text-slate-700 dark:text-slate-300">
            <span>{isEn ? `Round ${room.currentRound}/${room.totalRounds}` : `রাউন্ড ${room.currentRound}/${room.totalRounds}`}</span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Score & Rules Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsScoreRulesOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-bold text-[11px] cursor-pointer transition-colors"
              title={isEn ? 'View Live Score & Rules' : 'লাইভ স্কোর ও নিয়মাবলী'}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Score & Rules' : 'স্কোর ও নিয়ম'}</span>
            </button>

            {/* BGM Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                handleToggleBgm();
              }}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isBgmPlaying
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={isBgmPlaying ? (isEn ? 'Mute Music' : 'মিউজিক বন্ধ করুন') : (isEn ? 'Play Music' : 'মিউজিক চালু করুন')}
            >
              {isBgmPlaying ? <Music className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Exit Room Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsConfirmingExit(true);
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={isEn ? 'Exit Room' : 'রুম থেকে বের হন'}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}



      {/* Requirement 6: Persistent Live Score & Rule Book Modal */}
      {isScoreRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerTab('scores')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === 'scores'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isEn ? '📊 Live Standings & Points' : '📊 বর্তমান পয়েন্ট ও স্কোর'}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('rules')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === 'rules'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isEn ? '📜 Rules & Scoring Chart' : '📜 নিয়ম ও পয়েন্ট চার্ট'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsScoreRulesOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-3 space-y-3 flex-1 text-xs">
              {drawerTab === 'scores' ? (
                /* Tab 1: Live Standings & Round Score Breakdown */
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    {players
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((p, idx) => {
                        const isMe = p.id === currentPlayer.id;
                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                              isMe
                                ? 'bg-amber-500/10 border-amber-500/40'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-slate-400 w-4 text-center">
                                #{idx + 1}
                              </span>
                              <span className="text-lg">{p.avatar || '🕵️'}</span>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white truncate block">
                                  {p.name} {isMe && (isEn ? '(You)' : '(আপনি)')}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {isEn ? p.titleEn : p.titleBn}
                                </span>
                              </div>
                            </div>
                            <div className="font-mono font-black text-amber-500 text-sm shrink-0">
                              {p.score} {isEn ? 'pts' : 'পয়েন্ট'}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Previous round point reasons if available */}
                  {room.scoreDetails && room.scoreDetails.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {isEn ? 'Last Round Score Breakdown:' : 'সর্বশেষ রাউন্ডের পয়েন্ট অর্জনের কারণ:'}
                      </div>
                      {room.scoreDetails.map((detail) => (
                        <div key={detail.playerId} className="text-[11px] flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-1 last:border-0">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {detail.playerName}:
                          </span>
                          <span className={detail.pointsDelta >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                            {detail.pointsDelta >= 0 ? `+${detail.pointsDelta}` : detail.pointsDelta} pts
                            {detail.reasons && detail.reasons.length > 0 && (
                              <span className="text-slate-400 font-normal ml-1">
                                ({isEn ? detail.reasons[0].en : detail.reasons[0].bn})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Compact Rules & Scoring Chart */
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <h4 className="font-bold text-amber-700 dark:text-amber-400 text-xs">
                      {isEn ? '🎯 Quick Gameplay Guide' : '🎯 সংক্ষিপ্ত খেলার নিয়ম'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isEn
                        ? '1. Role Reveal: View secret card. Citizens see word, Imposter sees clue only. 2. Clue Stage: Everyone gives 1 subtle clue in sequence. 3. Interrogation: Voice talk or chat. 4. Voting: Vote out suspected Imposter!'
                        : '১. গোপন কার্ড: নাগরিকরা আসল শব্দ দেখেন, ধাপ্পাবাজ পায় কেবল ইঙ্গিত। ২. ক্লু পর্ব: ক্রমানুসারে সবাই ১টি ক্লু দেন। ৩. আলোচনা: চ্যাট বা মাইকে জেরা করুন। ৪. ভোটদান: ধাপ্পাবাজকে ভোট দিয়ে শনাক্ত করুন!'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {isEn ? '🏆 Point Scoring System' : '🏆 পয়েন্ট অর্জনের নিয়মাবলি'}
                    </h4>
                    <table className="w-full text-[11px] text-left">
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Correct Imposter vote' : 'সঠিক ধাপ্পাবাজকে ভোট দেওয়া'}
                          </td>
                          <td className="py-1 text-right text-emerald-500 font-bold">+৪</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Eliminated Imposter bonus' : 'ধাপ্পাবাজ বহিষ্কার বোনাস'}
                          </td>
                          <td className="py-1 text-right text-emerald-500 font-bold">+১</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Mistaken vote on Citizen' : 'নির্দোষকে ভুল ভোট দেওয়া'}
                          </td>
                          <td className="py-1 text-right text-rose-500 font-bold">-১</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Wrongly eliminated Citizen bonus' : 'নির্দোষ বহিষ্কৃত হওয়ার সান্ত্বনা বোনাস'}
                          </td>
                          <td className="py-1 text-right text-amber-500 font-bold">+৩</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Imposter survived and won' : 'ধাপ্পাবাজ জয়ী হলে'}
                          </td>
                          <td className="py-1 text-right text-emerald-500 font-bold">+৫</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Imposter received 0 votes' : 'ধাপ্পাবাজ শূন্য ভোট পেলে বোনাস'}
                          </td>
                          <td className="py-1 text-right text-sky-500 font-bold">+৩</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-sans text-slate-600 dark:text-slate-300">
                            {isEn ? 'Imposter caught / eliminated' : 'ধাপ্পাবাজ ধরা পড়লে বা হারলে'}
                          </td>
                          <td className="py-1 text-right text-slate-400 font-bold">০</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsScoreRulesOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
              >
                {isEn ? 'Close & Return to Match' : 'বন্ধ করুন ও খেলায় ফিরুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {isConfirmingExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-2xl">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentPlayer.isHost
                  ? isEn
                    ? 'Close Room for All?'
                    : 'সবার জন্য রুমটি বন্ধ করতে চান?'
                  : isEn
                  ? 'Leave Room?'
                  : 'রুম ত্যাগ করতে চান?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentPlayer.isHost
                  ? isEn
                    ? 'Leaving as host will immediately close this room for all connected players.'
                    : 'আপনি হোস্ট। আপনি বের হলে সবার জন্য এই রুমটি বন্ধ হয়ে যাবে।'
                  : isEn
                  ? 'Are you sure you want to leave this game room?'
                  : 'আপনি কি নিশ্চিত যে এই রুমটি ত্যাগ করতে চান?'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingExit(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Stay' : 'থাকুন'}
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                {isEn ? 'Leave Room' : 'বেরিয়ে যান'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Router based on current phase */}
      {(() => {
        switch (room.currentPhase) {
          case 'LOBBY':
            return (
              <OnlineLobbyScreen
                room={room}
                players={players}
                currentPlayer={currentPlayer}
                lang={lang}
                theme={theme}
                onLeave={onExit}
                onOpenAdmin={onOpenAdmin}
              />
            );

          case 'ROLE_REVEAL':
            return (
              <OnlineRoleRevealScreen
                room={room}
                currentPlayer={currentPlayer}
                privateRole={privateRole}
                players={players}
                lang={lang}
                theme={theme}
              />
            );

          case 'CLUE':
            return (
              <OnlineClueScreen
                room={room}
                currentPlayer={currentPlayer}
                privateRole={privateRole}
                players={players}
                lang={lang}
                theme={theme}
              />
            );

          case 'DISCUSSION':
            return (
              <OnlineDiscussionScreen
                room={room}
                currentPlayer={currentPlayer}
                players={players}
                lang={lang}
                theme={theme}
              />
            );

          case 'VOTING':
            return (
              <OnlineVotingScreen
                room={room}
                currentPlayer={currentPlayer}
                players={players}
                votes={votes}
                lang={lang}
                theme={theme}
              />
            );

          case 'IMPOSTER_GUESS':
            return (
              <OnlineImposterGuessScreen
                room={room}
                currentPlayer={currentPlayer}
                privateRole={privateRole}
                players={players}
                lang={lang}
                theme={theme}
              />
            );

          case 'RESULT':
            return (
              <OnlineResultScreen
                room={room}
                currentPlayer={currentPlayer}
                players={players}
                lang={lang}
                theme={theme}
              />
            );

          case 'ROUND_SUMMARY':
            return (
              <OnlineScoreboardScreen
                room={room}
                currentPlayer={currentPlayer}
                players={players}
                lang={lang}
                theme={theme}
                onExitToMenu={onExit}
              />
            );

          case 'GAME_OVER':
            return (
              <OnlineGameOverScreen
                room={room}
                currentPlayer={currentPlayer}
                players={players}
                lang={lang}
                theme={theme}
                onExitToMenu={onExit}
              />
            );

          default:
            return (
              <OnlineLobbyScreen
                room={room}
                players={players}
                currentPlayer={currentPlayer}
                lang={lang}
                theme={theme}
                onLeave={onExit}
              />
            );
        }
      })()}
    </div>
  );
};
