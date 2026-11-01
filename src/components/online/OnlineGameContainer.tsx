import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Language, Theme } from '../../types/game';
import {
  OnlinePlayer,
  OnlineRoomData,
  PrivatePlayerRole,
  OnlineVote,
  RoomClosedReason,
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
}

export const OnlineGameContainer: React.FC<OnlineGameContainerProps> = ({
  initialRoom,
  initialPlayer,
  lang,
  theme,
  onExit,
  onReopenOnlineModal,
}) => {
  const isEn = lang === 'en';
  const [room, setRoom] = useState<OnlineRoomData>(initialRoom);
  const [players, setPlayers] = useState<OnlinePlayer[]>([initialPlayer]);
  const [privateRole, setPrivateRole] = useState<PrivatePlayerRole | null>(null);
  const [votes, setVotes] = useState<OnlineVote[]>([]);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [closedReason, setClosedReason] = useState<RoomClosedReason>(null);
  const [isConfirmingExit, setIsConfirmingExit] = useState<boolean>(false);

  // Countdown for host disconnect grace period
  const [hostDisconnectSecondsLeft, setHostDisconnectSecondsLeft] = useState<number | null>(null);

  const currentUserId = auth.currentUser?.uid || initialPlayer.id;
  const isHost = room.hostId === currentUserId;

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
        // Check if current user is still in the players list
        const stillInRoom = updatedPlayers.some((p) => p.id === currentUserId);
        if (!stillInRoom && updatedPlayers.length > 0) {
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

    // Heartbeat every 10 seconds & check inactivity / host disconnect
    const heartbeatInterval = setInterval(async () => {
      const myPlayer = players.find((p) => p.id === currentUserId);
      if (myPlayer) {
        await sendPlayerHeartbeat(initialRoom.roomCode, isHost, myPlayer.name, myPlayer.avatar);
      }
      // Check inactivity & host disconnect expiration
      await checkAndExpireRoomIfNeeded(initialRoom.roomCode, room);
    }, 10000);

    // Window beforeunload / visibility listener for unexpected disconnects
    const handleBeforeUnload = () => {
      if (isHost) {
        setHostDisconnected(initialRoom.roomCode, true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isHost) {
          setHostDisconnected(initialRoom.roomCode, true);
        }
      } else if (document.visibilityState === 'visible') {
        if (isHost) {
          setHostDisconnected(initialRoom.roomCode, false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubPrivate();
      unsubVotes();
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialRoom.roomCode, currentUserId, isHost, room]);

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

      {/* Floating Global Leave/Exit Button available in all active phases */}
      {room.currentPhase !== 'LOBBY' && (
        <div className="fixed top-3 right-3 z-40">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsConfirmingExit(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-500 text-white backdrop-blur-md border border-white/10 text-xs font-bold shadow-lg transition-all cursor-pointer"
            title={isEn ? 'Exit Game' : 'খেলা থেকে বের হন'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'Exit Room' : 'বের হন'}</span>
          </button>
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
