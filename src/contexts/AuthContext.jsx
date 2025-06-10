// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  // 1. استيراد الدوال الجديدة لإنشاء الحساب وتسجيل الدخول
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  // 2. استيراد الدوال اللازمة لإنشاء مستند جديد في قاعدة البيانات
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

// إنشاء الـ Context
const AuthContext = createContext();

// Hook مخصص لتسهيل استخدام الـ Context
export function useAuth() {
  return useContext(AuthContext);
}

// المكون الرئيسي للـ Provider
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // مراقبة حالة تسجيل دخول المستخدم (هذا الكود كما هو وممتاز)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // التحقق إذا كان المستخدم هو admin
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("خطأ في التحقق من الصلاحيات:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- الدوال الجديدة ---

  /**
   * دالة لإنشاء حساب مستخدم جديد
   * تقوم بإنشاء الحساب في Firebase Auth ثم إنشاء مستند له في Firestore
   */
  const signUp = async (email, password, displayName) => {
    // الخطوة 1: إنشاء المستخدم في خدمة Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // الخطوة 2: تحديث اسم المستخدم في ملفه الشخصي داخل Auth
    await updateProfile(user, { displayName });

    // الخطوة 3 (الحل الأهم): إنشاء مستند للمستخدم في مجموعة 'users' في Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      createdAt: serverTimestamp(), // يسجل وقت إنشاء الحساب
      role: 'user'                  // يمكن تحديد دور افتراضي للمستخدم
    });
    
    // تحديث الحالة المحلية فوراً لتعكس بيانات المستخدم الجديد كاملة
    setCurrentUser(auth.currentUser);

    return user;
  };

  /**
   * دالة لتسجيل دخول مستخدم موجود بالفعل
   */
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };


  // --- الدوال القديمة (كما هي) ---
  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserPassword = (newPassword) => {
    if (!currentUser) return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    return firebaseUpdatePassword(currentUser, newPassword);
  };

  const reauthenticateUser = (currentPassword) => {
    if (!currentUser) return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    return reauthenticateWithCredential(currentUser, credential);
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return Promise.reject(new Error("لا يوجد مستخدم حالياً."));
    await updateProfile(currentUser, updates);
    // تحديث حالة المستخدم الحالية بعد التعديل لضمان تزامن البيانات
    setCurrentUser({ ...auth.currentUser });
  };


  // تجميع كل القيم والدوال لمشاركتها عبر الـ Context
  const value = {
    currentUser,
    isAdmin,
    loading,
    signUp, // <-- تمت الإضافة
    signIn, // <-- تمت الإضافة
    signOut,
    sendPasswordReset,
    updateUserPassword,
    reauthenticateUser,
    updateUserProfile,
  };

  // عرض شاشة تحميل أثناء جلب بيانات المستخدم
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  // إتاحة الـ Context للتطبيقات الفرعية
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
