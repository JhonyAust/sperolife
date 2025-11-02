// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA6QqCwdWukzL9Uxm1SawxSc6zK3A_OP2U",
  authDomain: "sperolife-a5e35.firebaseapp.com",
  projectId: "sperolife-a5e35",
  storageBucket: "sperolife-a5e35.firebasestorage.app",
  messagingSenderId: "446964775657",
  appId: "1:446964775657:web:ce01c966c0032bfc928e78",
  measurementId: "G-WVGYJSNBH9",
};

// Prevent re-initialization in Next.js hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add popup and redirect options
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (initialize only in browser, without top-level await)
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  });
}

export const analytics = analyticsInstance;
export default app;