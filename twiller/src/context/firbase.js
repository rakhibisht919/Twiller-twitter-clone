
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Debug logging
console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  storageBucket: firebaseConfig.storageBucket || 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'MISSING',
  measurementId: firebaseConfig.measurementId || 'MISSING'
});

if (!firebaseConfig.apiKey) {
  // Helpful hint if .env wasn't loaded or keys are wrong
  // eslint-disable-next-line no-console
  console.warn("Firebase env vars missing. Ensure twiller/.env has REACT_APP_* keys and restart npm start.");
}

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create a mock auth object to prevent app crashes
  auth = {
    currentUser: null,
    signOut: () => Promise.resolve(),
    onAuthStateChanged: () => () => {}
  };
}

export { auth };
export default app;
// const analytics = getAnalytics(app);
