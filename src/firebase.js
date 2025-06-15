// src/firebase.js (أو src/firebase/index.js)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, Timestamp, query, where, orderBy, writeBatch, increment, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  // ... بيانات الإعدادات الخاصة بك هنا ...
  apiKey: "AIz...",
  authDomain: "right-water-462222.firebaseapp.com",
  projectId: "right-water-462222",
  storageBucket: "right-water-462222.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// تهيئة موفري تسجيل الدخول الاجتماعي
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// 🔥🔥 الأهم: قم بتصدير كل شيء تحتاجه من هنا 🔥🔥
export {
  auth,
  db,
  storage,
  googleProvider,
  facebookProvider,
  twitterProvider,
  // دوال Firestore
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query, // <-- تصدير الدالة الناقصة
  where,
  orderBy,
  writeBatch,
  increment,
  onSnapshot,
  // دوال Storage
  ref,
  uploadBytesResumable,
  getDownloadURL
};
