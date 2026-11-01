# Vercel Production Deployment Guide - Dhappabaj (ধাপ্পাবাজ)

This guide explains how to deploy **Dhappabaj** to Vercel with **zero environment variable hassle**.

---

## ⚡ Quick Summary: NO Environment Variables Needed in Vercel!

You **DO NOT need to enter any environment variables in Vercel**. 
Leave the Vercel "Environment Variables" section completely **empty**.

### Why did Vercel show the warning?
> *"Remove the public framework prefix to keep this value private. Public prefixes expose values to the browser. If that's safe, change the variable to Config."*

Vercel's dashboard has an automated security scanner. Whenever you enter a variable name that begins with a public frontend prefix (like `VITE_`) and also contains words like `_API_KEY`, Vercel warns you that this value will be exposed to the user's browser, and prompts you to change the type from "Secret" to "Config" (Plain text). If you do not change it to Config, Vercel automatically discards/removes it.

**You can completely ignore adding variables in Vercel:**
In client-side Firebase web applications, the Firebase API key is **public by design** (used by Google to route requests to your Firebase project, while data security is enforced by Firestore Security Rules).
All configuration (`apiKey`, `projectId`, `appId`, `firestoreDatabaseId`) is **already built directly into `src/firebase.ts` and `firebase-applet-config.json`** inside this repository.

When Vercel builds the project (`npm run build`), Vite automatically bakes this configuration into the build. You do not need to configure anything in Vercel's Environment Variables tab!

---

## 1. Step-by-Step Vercel Deployment

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Go to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
3. Import your Dhappabaj repository.
4. Keep the default settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Leave Environment Variables completely empty.**
6. Click **Deploy**.

---

## 2. The ONLY Thing Required: Add Vercel Domain to Firebase Console

To allow your deployed Vercel site to authenticate and open rooms:

1. Copy your Vercel deployment URL (e.g. `dhappabaj.vercel.app` or `your-app-name.vercel.app`).
2. Go to the [Firebase Console Authorized Domains](https://console.firebase.google.com/project/semiotic-dryad-kwpgt/authentication/settings).
3. Under **Authorized domains**, click **Add domain**.
4. Paste your domain (e.g. `dhappabaj.vercel.app`). Do not include `https://`.
5. Click **Save**.

### Also verify Anonymous Login is enabled:
- In Firebase Console, go to **Authentication** -> **Sign-in method**.
- Verify that **Anonymous** is set to **Enabled**.

---

## 3. Verifying Your Vercel Deployment

Once deployed on Vercel:
1. Open your Vercel URL on your mobile phone or browser.
2. Click **অনলাইন রুম (Online Room)**.
3. At the bottom of the modal, tap **নেটওয়ার্ক পরীক্ষা (Diagnostics)**.
4. Tap **Re-test Production Ping**.
5. It will run a live ping against Firebase and show:
   `✓ All systems active. Total latency: ~300ms`
6. Click **রুম তৈরি ও হোস্ট করুন (Create Room & Host)**. Your room will open instantly in ~1 second!
