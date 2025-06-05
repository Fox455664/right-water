import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-foreground">جاري التحقق من صلاحيات الدخول...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const isAdmin = currentUser.email && (currentUser.email.toLowerCase() === 'admin@rightwater.com' || currentUser.email.toLowerCase() === 'testadmin@example.com');
    if (!isAdmin) {
      return <Navigate to="/" replace />; 
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
