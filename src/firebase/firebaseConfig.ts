// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAwKSW2HzGrGigVlbkpsrHQ5aWKYzRKECs",
  authDomain: "task-kanban-3da38.firebaseapp.com",
  projectId: "task-kanban-3da38",
  storageBucket: "task-kanban-3da38.firebasestorage.app",
  messagingSenderId: "751189645009",
  appId: "1:751189645009:web:99ec72a64763bd32f6d7f0",
  measurementId: "G-RJKXS1KD2H"
};

const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance
const auth = getAuth(app);

// Get Google Auth Provider
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, provider);
};

export const logOut = async () => {
  return signOut(auth);
};

export { auth };
