import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  // المستخدم غير مسجل دخول
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // التحقق من صلاحية الأدمن (تحقق مبسط بالبريد)
  if (adminOnly) {
    const email = currentUser.email?.toLowerCase();
    const isAdmin = email === 'admin@rightwater.com' || email === 'testadmin@example.com';

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // السماح بالوصول
  return <Outlet />;
};

export default ProtectedRoute;
