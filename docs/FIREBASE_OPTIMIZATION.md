# Dhappabaj Firebase and hosting optimisation

This branch reduces Firestore traffic and tightens client access. It does not change the core game rules or scoring system.

## Changes in this branch

- Removed the online lobby chat UI and chat read/write service.
- Removed chat-message cleanup from each round start. Legacy messages are deleted only when a room closes or expires.
- Increased the Firestore player heartbeat interval from 35 seconds to 120 seconds.
- Removed unnecessary parent-room writes for player profile, ready, vote and card-seen actions.
- The host heartbeat updates the room's displayed player count.
- Only the host can run host-controlled round start, phase changes, clue timeout advancement and vote resolution.
- A clue can be submitted only by the player whose clue turn is active.
- Only the assigned imposter can submit the final guess.
- Added closed-room subcollection cleanup for players, private roles, votes and legacy messages.
- Closed rooms receive an `expiresAt` timestamp 24 hours in the future.
- Prevented duplicate lifetime-stat updates when the game-over screen rerenders.
- Removed the client-side admin passcode. Admin access now requires the configured owner Google account.
- Added stricter Firestore rules for user profiles, rooms, private roles, votes, match history and admin collections.

## Release order

1. Review and test the branch's Vercel Preview deployment.
2. Merge the pull request only after the multiplayer flows have been tested with 3 to 10 players.
3. Publish the updated `firestore.rules` in Firebase Console at the same release time as the new frontend. The rules file is not deployed automatically by Vercel.
4. Confirm owner Google sign-in still works in the admin panel.
5. Enable the Firestore TTL policy described below.

Do not publish the stricter rules to the production Firebase project while the old production frontend is still serving users. The old client writes some room fields differently and may be rejected by the new rules.

## Enable automatic deletion of closed room documents

The application now writes a Firestore Timestamp field named `expiresAt` when a room closes or expires. Room subcollections are cleaned immediately by the client cleanup routine. To remove the remaining parent room document automatically:

1. Open Firebase Console and select the Dhappabaj project.
2. Open Firestore Database.
3. Find the Time-to-live section.
4. Create a TTL policy for collection group `rooms` using field `expiresAt`.
5. Save and wait for the policy to become active.

TTL deletion is asynchronous. It is not an exact 24-hour timer.

## Important limitations and manual setup

- The heartbeat still uses Firestore, but at a lower frequency. Moving presence to Firebase Realtime Database would reduce listener fan-out further, but requires enabling Realtime Database, adding its database URL and deploying Realtime Database security rules. That migration is not part of this branch.
- Cleanup runs when a room is explicitly closed, expires while a client is connected, or is removed by an admin. The TTL policy deletes the parent room document after 24 hours. It does not cascade-delete subcollections, which is why the application cleans those first.
- Firestore rules should be tested with the Firebase Emulator Suite before production release. This branch includes a CI type-check and Vite build, but CI does not deploy or emulator-test Firestore rules.
- The admin passcode was previously shipped in the client bundle. It has been removed. If that passcode was reused anywhere else, change it there too.
- Client-side host authority is not a substitute for a trusted server. For stronger anti-cheat protection, move score calculation, role assignment and match finalisation into trusted Cloud Functions or another server-side backend.

## Basic test checklist

- Create a room as host.
- Join with 2 to 9 additional players.
- Toggle ready, rename and kick a player.
- Start a match and complete clue turns.
- Cast votes and resolve voting.
- Complete an imposter final guess, when enabled.
- Finish a match and confirm each player's lifetime stats increase exactly once.
- Play another match in the same room.
- Leave as a non-host, leave as host, and test an abandoned room.
- Confirm a closed room's subcollections are removed.
- Test owner-only admin sign-in and admin actions.
