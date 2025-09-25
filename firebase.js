// firebase.js (Expo friendly)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBr_YoPrBDwFNeeZCPXapVvHQeY58Z_-so",
  authDomain: "the-cube-92d63.firebaseapp.com",
  projectId: "the-cube-92d63",
  storageBucket: "the-cube-92d63.appspot.com",
  messagingSenderId: "508362974198",
  appId: "1:508362974198:web:bde98ea79eb3ffbb345dd7",
  measurementId: "G-TB8LYFRSSY",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);   
export const db = getFirestore(app);
