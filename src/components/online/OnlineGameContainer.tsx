import React, { useState, useEffect } from 'react';
import { Language, Theme } from '../../types/game';
import {
  OnlinePlayer,
  OnlineRoomData,
  PrivatePlayerRole,
  OnlineVote,
} from '../../types/multiplayer';
import {
  subscribeToOnlineRoom,
  subscribeToOnlinePlayers,
  subscribeToOnlinePrivateRole,
  subscribeToOnlineVotes,
  updateOnlinePlayerProfile,
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

interface OnlineGameContainerProps {
  initialRoom: OnlineRoomData;
  initialPlayer: OnlinePlayer;
  lang: Language;
  theme: Theme;
  onExit: () => void;
}

export const OnlineGameContainer: React.FC<OnlineGameContainerProps> = ({
  initialRoom,
  initialPlayer,
  lang,
  theme,
  onExit,
}) => {
  const isEn = lang === 'en';
  const [room, setRoom] = useState<OnlineRoomData>(initialRoom);
  const [players, setPlayers] = useState<OnlinePlayer[]>([initialPlayer]);
  const [privateRole, setPrivateRole] = useState<PrivatePlayerRole | null>(null);
  const [votes, setVotes] = useState<OnlineVote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [kickedOrLeft, setKickedOrLeft] = useState<boolean>(false);

  const currentUserId = auth.currentUser?.uid || initialPlayer.id;

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubRoom = subscribeToOnlineRoom(
      initialRoom.roomCode,
      (updatedRoom) => {
        if (!updatedRoom) {
          // Room was deleted
          setKickedOrLeft(true);
        } else {
          setRoom(updatedRoom);
          setLoading(false);
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
          setKickedOrLeft(true);
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

    // Heartbeat every 20 seconds
    const heartbeat = setInterval(() => {
      const myPlayer = players.find((p) => p.id === currentUserId);
      if (myPlayer) {
        updateOnlinePlayerProfile(initialRoom.roomCode, myPlayer.name);
      }
    }, 20000);

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubPrivate();
      unsubVotes();
      clearInterval(heartbeat);
    };
  }, [initialRoom.roomCode, currentUserId]);

  if (kickedOrLeft) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-3xl">
            🚪
          </div>
          <h2 className="text-xl font-bold">
            {isEn ? 'Room Closed or Disconnected' : 'রুমটি বন্ধ বা সংযোগ বিচ্ছিন্ন হয়েছে'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEn
              ? 'You have been disconnected from the room.'
              : 'আপনি রুমটি ত্যাগ করেছেন অথবা হোস্ট রুম বন্ধ করেছেন।'}
          </p>
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
          >
            {isEn ? 'Return to Main Menu' : 'মূল মেন্যুতে ফিরে যান'}
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find((p) => p.id === currentUserId) || initialPlayer;

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
};
