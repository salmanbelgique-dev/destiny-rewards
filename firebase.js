// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { getDatabase, ref, set, get } from "firebase/database";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOCEyQN4zcZyNTWhO9-mN1-sBxM3RSywI",
  authDomain: "destiny-rewards-f3a5d.firebaseapp.com",
  projectId: "destiny-rewards-f3a5d",
  storageBucket: "destiny-rewards-f3a5d.firebasestorage.app",
  messagingSenderId: "650427918746",
  appId: "1:650427918746:web:6a8c4c94f38169a28bf223",
  measurementId: "G-RMRCER7949"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize Databases
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Expose references globally so non-module scripts can access them
window.firebaseAuth = auth;
window.firebaseProvider = provider;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.signInWithRedirect = signInWithRedirect;
window.getRedirectResult = getRedirectResult;
window.updateProfile = updateProfile;
window.onAuthStateChanged = onAuthStateChanged;

// Automatic Global Auth Observer to keep UI & state in sync on page load or sign in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase Auth Observer: User is logged in ->", user.email || user.displayName);
    localStorage.setItem("profileIsLoggedIn", "true");
    if (user.displayName) localStorage.setItem("profileName", user.displayName);
    if (user.email) localStorage.setItem("profileEmail", user.email);
    if (user.photoURL) localStorage.setItem("profileLogo", user.photoURL);

    const checkAndSync = () => {
      if (typeof window.handleLoggedInUser === "function") {
        window.handleLoggedInUser(user);
      } else {
        setTimeout(checkAndSync, 100);
      }
    };
    checkAndSync();
  } else {
    console.log("Firebase Auth Observer: No active user session.");
  }

  if (typeof window.initDebugPanel === "function") {
    window.initDebugPanel();
  }
});

// Expose DB helpers
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.collection = collection;
window.getDocs = getDocs;
window.rtdb = rtdb;
window.rtdbRef = ref;
window.rtdbSet = set;
window.rtdbGet = get;

// Initialize Supabase Client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  window.supabase = supabaseClient;
} else {
  console.warn("Supabase configuration is using placeholder values. Set your actual Supabase URL and Anon Key in firebase.js.");
  window.supabase = null;
}




