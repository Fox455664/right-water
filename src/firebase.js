// src/firebase.js (النسخة الكاملة والصحيحة)

// 1. استيراد الدوال الأساسية
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider,
  // أضف أي دوال مصادقة أخرى تستخدمها هنا
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp, 
  query, 
  where, 
  orderBy, 
  writeBatch, 
  increment,
  onSnapshot
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";

// 2. إعدادات Firebase الخاصة بك (من الملف الذي أرسلته)
const firebaseConfig = {
  apiKey: "AIzaSyBVkdyjJi3l-QB1KpSQJle_P9ujHQ2LTn0", // استخدم مفتاحك الحقيقي
  authDomain: "right-water.firebaseapp.com",
  databaseURL: "https://right-water-default-rtdb.firebaseio.com",
  projectId: "right-water",
  storageBucket: "right-water.firebasestorage.app",
  messagingSenderId: "134412024932",
  appId: "1:134412024932:web:be47e36b50f087e2a87371",
  measurementId: "G-0RZ3XYPXR7"
};

// 3. تهيئة التطبيق والخدمات
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4. تهيئة موفري تسجيل الدخول الاجتماعي
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// 5. تصدير كل شيء مركزيًا ليستخدمه باقي التطبيق
// هذا هو الجزء الأهم الذي كان ناقصًا
export {
  auth,
  db,
  storage,
  googleProvider,
  facebookProvider,
  twitterProvider,
  // دوال المصادقة
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  signInWithPopup,
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
  query,
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
