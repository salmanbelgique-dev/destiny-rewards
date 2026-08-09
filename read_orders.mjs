import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOCEyQN4zcZyNTWhO9-mN1-sBxM3RSywI",
  authDomain: "www.destinyrewards.store",
  projectId: "destiny-rewards-f3a5d",
  storageBucket: "destiny-rewards-f3a5d.firebasestorage.app",
  messagingSenderId: "650427918746",
  appId: "1:650427918746:web:6a8c4c94f38169a28bf223",
  measurementId: "G-RMRCER7949"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkOrders() {
  console.log("Fetching order JO7DE from Firestore...");
  try {
    const docSnap = await getDoc(doc(db, "orders", "JO7DE"));
    if (!docSnap.exists()) {
      console.log("Order JO7DE not found in the database!");
    } else {
      console.log(`Found Order JO7DE!`);
      console.log(docSnap.data());
    }
  } catch (error) {
    console.error("Error reading order:", error);
  }
  process.exit(0);
}

checkOrders();
