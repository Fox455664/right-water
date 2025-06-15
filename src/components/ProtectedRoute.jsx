// src/components/ProtectedRoute.jsx (النسخة المعدلة والمحسنة)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // تأكد أن هذا هو المسار الصحيح
import { Loader2 } from 'lucide-react';

// 🔥🔥 التعديل هنا: غيرنا اسم الخاصية إلى adminOnly 🔥🔥
const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل، وجهه لصفحة الدخول
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 🔥🔥 التعديل هنا: منطق التحقق من الأدمن 🔥🔥
  // إذا كان المسار يتطلب صلاحية أدمن والمستخدم ليس أدمن، وجهه للصفحة الرئيسية
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // إذا كان كل شيء على ما يرام، اعرض المحتوى
  return <Outlet />;
};

export default ProtectedRoute;
