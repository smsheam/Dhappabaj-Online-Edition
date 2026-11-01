# Vercel Production Deployment Guide - Dhappabaj (ধাপ্পাবাজ)

This guide explains how to deploy **Dhappabaj** to Vercel and ensure real-time global multiplayer works seamlessly.

---

## 1. Architecture Overview
- **Frontend**: Vite + React 19 SPA (Client-Side Rendering)
- **Backend & Persistence**: Firebase Cloud Firestore (Database ID: `ai-studio-dhappabajonlinee-ceeaf2df-4aeb-4a70-8e6b-1923970426eb`)
- **Authentication**: Firebase Authentication (Anonymous Guest + Optional Google Sign-In)
- **Realtime**: Firestore `onSnapshot` real-time listeners over HTTPS long polling (`experimentalForceLongPolling: true`).
- **No external server required**: Vercel serves the static bundle, and clients connect directly to Cloud Firestore.

---

## 2. Vercel Environment Variables
In your Vercel Project Dashboard (`Settings` -> `Environment Variables`), configure the following variables (for **Production**, **Preview**, and **Development**):

| Key | Value |
|---|---|
| `VITE_FIREBASE_PROJECT_ID` | `semiotic-dryad-kwpgt` |
| `VITE_FIREBASE_APP_ID` | `1:730462018709:web:a12aee3e1050a653aacf9c` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCL-DpBxGovTk1JzA4g_BPltIwyK_uMKx4` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `semiotic-dryad-kwpgt.firebaseapp.com` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | `ai-studio-dhappabajonlinee-ceeaf2df-4aeb-4a70-8e6b-1923970426eb` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `semiotic-dryad-kwpgt.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `730462018709` |

> *Note:* Even if environment variables are not set in Vercel, the app automatically falls back to `firebase-applet-config.json` bundled in the repo.

---

## 3. Firebase Console Configuration (Crucial for Vercel)

### Step A: Authorize your Vercel Domain (For Google Sign-In & Auth)
1. Go to the [Firebase Console](https://console.firebase.google.com/project/semiotic-dryad-kwpgt/authentication/settings).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Click **Add domain**.
4. Enter your Vercel deployment domain:
   - `your-app-name.vercel.app`
   - Any custom domains (e.g. `dhappabaj.com`).
5. Click **Save**.

### Step B: Verify Anonymous Sign-in is Enabled
1. In Firebase Console, go to **Authentication** -> **Sign-in method**.
2. Ensure **Anonymous** is set to **Enabled**.
3. Ensure **Google** is set to **Enabled** (if you want players to sign in with Google).

---

## 4. Vercel Project Settings
When importing the Git repository into Vercel:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- The included `vercel.json` automatically handles client-side SPA routing (`rewrites` to `/index.html`).

---

## 5. Built-in Production Diagnostics
On the deployed site:
1. Click **অনলাইন রুম (Online Room)**.
2. At the bottom of the modal, tap **নেটওয়ার্ক পরীক্ষা (Diagnostics)**.
3. Tap **Re-test Production Ping**.
4. It tests live Auth and Firestore latency in real-time and reports whether everything is connected.
