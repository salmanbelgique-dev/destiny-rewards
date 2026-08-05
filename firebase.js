// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { getDatabase, ref, set, get, onDisconnect, serverTimestamp as rtdbServerTimestamp } from "firebase/database";
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
    if (user.email) localStorage.setItem("profileEmail", user.email);

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

  // Update visitor record if user logged in / out
  if (typeof window.updateVisitorData === "function") {
    window.updateVisitorData(true);
  }
});

// Expose DB helpers
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.serverTimestamp = serverTimestamp;
window.collection = collection;
window.getDocs = getDocs;
window.onSnapshot = onSnapshot;
window.query = query;
window.where = where;
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

// ==============================================================================
// STEP 1: Generate or retrieve a unique visitor ID stored in localStorage
// ==============================================================================
let visitorId = localStorage.getItem("visitorId");
if (!visitorId) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    visitorId = crypto.randomUUID();
  } else {
    visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
  localStorage.setItem("visitorId", visitorId);
}
window.visitorId = visitorId;

// ==============================================================================
// STEP 2 & STEP 3: Save and Update visitor state in NEW Firestore 'visitor' collection
// ==============================================================================
const visitorRef = doc(db, "visitor", visitorId);

const updateVisitorData = async (isOnline = true) => {
  try {
    const isLoggedIn = !!auth.currentUser;
    await setDoc(visitorRef, {
      visitorId: visitorId,
      online: isOnline,
      page: window.location.pathname || "/",
      lastSeen: serverTimestamp(),
      loggedIn: isLoggedIn
    }, { merge: true });
  } catch (err) {
    console.warn("Visitor tracking update error:", err);
  }
};
window.updateVisitorData = updateVisitorData;

// Initial save on page load
updateVisitorData(true);

// Update on page navigation or tab visibility change
window.addEventListener("popstate", () => updateVisitorData(true));
window.addEventListener("focus", () => updateVisitorData(true));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    updateVisitorData(true);
  }
});

// Periodic heartbeat (every 30 seconds) to refresh lastSeen timestamp
setInterval(() => {
  updateVisitorData(true);
}, 30000);

// ==============================================================================
// STEP 4: Remove visitor document from 'visitor' collection when leaving page
// ==============================================================================
window.addEventListener("beforeunload", () => {
  try {
    deleteDoc(visitorRef);
  } catch (e) {
    // Unload cleanup fallback
  }
});

// Realtime Database Presence detection for automatic disconnect handling
try {
  const rtdbVisitorRef = ref(rtdb, `visitor_presence/${visitorId}`);
  onDisconnect(rtdbVisitorRef).remove();
  set(rtdbVisitorRef, {
    online: true,
    page: window.location.pathname || "/",
    lastSeen: rtdbServerTimestamp()
  });
} catch (e) {
  console.warn("RTDB visitor presence setup warning:", e);
}

// Global utility for listening to live count of online users in 'visitor' collection
window.getOnlineVisitorCount = function(callback) {
  if (typeof callback !== "function") return;
  const q = query(collection(db, "visitor"), where("online", "==", true));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size, snapshot.docs.map(d => d.data()));
  }, (err) => {
    console.warn("Visitor count listener error:", err);
  });
};





