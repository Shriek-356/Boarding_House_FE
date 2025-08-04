// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { data } from "framer-motion/client";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiFVHmVIM_ljaGceIoWJnT57wtz17Nba0",
  authDomain: "bdhchat-f9a7d.firebaseapp.com",
  projectId: "bdhchat-f9a7d",
  storageBucket: "bdhchat-f9a7d.firebasestorage.app",
  messagingSenderId: "85708727389",
  appId: "1:85708727389:web:8f85d1cd3437fed94399b4",
  databaseURL: "https://bdhchat-f9a7d-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export {database}