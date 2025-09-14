// Firebase integration from blueprint:firebase_barebones_javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase app if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Sign in with Google using popup
export function signInWithGoogle() {
  console.log('signInWithGoogle: Starting popup sign-in...');
  return signInWithPopup(auth, provider)
    .then((result) => {
      console.log('signInWithGoogle: Popup sign-in successful');
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      
      console.log('Auth successful:', { user: user.displayName, email: user.email });
      return { user, token };
    })
    .catch((error) => {
      console.error('signInWithGoogle: Popup auth error:', error);
      throw error;
    });
}

// Sign out
export function signOutUser() {
  return signOut(auth);
}