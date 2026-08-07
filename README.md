<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cae221b3-d669-454f-9d9c-06d3eb94daa7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🔥 Firebase Setup (Auth + Firestore)

The app uses **Firebase Authentication** (email/password) and **Firestore** for
user profiles, transactions, investments, tasks, and team data.

> **No config? No problem.** If the Firebase env vars below are missing, the
> app automatically runs in **demo mode** (localStorage) so it still works.

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Give it a name (e.g. `vertex-invest`) and click **Create Project**

### 2. Enable Authentication

1. In your project: **Build → Authentication → Get started**
2. Under **Sign-in method**, enable **Email/Password**

### 3. Create a Firestore database

1. **Build → Firestore Database → Create database**
2. Choose **Production mode** (or test mode for quick local dev)
3. Pick a region close to you (e.g. `asia-south1`)

### 4. Register your web app

1. **Project settings (⚙️) → Your apps → Web app (`</>`)** — nickname it `web`
2. Copy the firebaseConfig object; it looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "vertex-invest.firebaseapp.com",
  projectId: "vertex-invest",
  storageBucket: "vertex-invest.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

### 5. Add the config to `.env.local`

Create a `.env.local` file in the project root (copy from [.env.example](.env.example)):

```env
VITE_FIREBASE_API_KEY="AIza..."                 # from step 4
VITE_FIREBASE_AUTH_DOMAIN="vertex-invest.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="vertex-invest"
VITE_FIREBASE_STORAGE_BUCKET="vertex-invest.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
```

### 6. Security Rules (recommended)

In **Firestore → Rules**, allow users to read/write only their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
  }
}
```

Restart `npm run dev` — you're now using real Firebase accounts and cloud data 🎉
