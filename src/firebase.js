
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_bE6gzFdIFfKQySJQi7uudfgvaVBAlxI",
  authDomain: "fox2-77fdd.firebaseapp.com",
  projectId: "fox2-77fdd",
  storageBucket: "fox2-77fdd.appspot.com",
  messagingSenderId: "442481432364",
  appId: "1:442481432364:web:eb72754872a4bd1eedbe89",
  measurementId: "G-CYKGWRT6FT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();


export { db, auth, storage, googleProvider, facebookProvider, twitterProvider };
