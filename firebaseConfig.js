// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2ugP-l22tDctoWCLYjEZnP3I84Jt9zGs",
  authDomain: "chit-chat-d11c0.firebaseapp.com",
  projectId: "chit-chat-d11c0",
  storageBucket: "chit-chat-d11c0.firebasestorage.app",
  messagingSenderId: "99804015467",
  appId: "1:99804015467:web:572c200b284db4c0cd7a2e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const usersRef = collection(db, "users");
export const roomsRef = collection(db, "rooms");
