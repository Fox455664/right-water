// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// --- استيراد الصفحات ---
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage'; // سنفترض أنك أنشأت هذا الملف
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import CartPage from '@/pages/CartPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UserProfilePage from '@/pages/UserProfilePage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage'; // <-- استيراد جديد لصفحة تتبع الطلب
import ChangePasswordPage from '@/pages/ChangePasswordPage'; // <-- استيراد جديد لصفحة تغيير كلمة المرور

// --- استيراد مكونات لوحة التحكم ---
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OrderManagement from '@/components/admin/OrderManagement';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import ProductManagement from '@/components/admin/ProductManagement';
import AdminSettings from '@/components/admin/AdminSettings';

// --- مكونات مساعدة ---
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const NotFoundPage = () => (
  <div className="text-center py-20">
    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
    <p className="text-2xl text-foreground mb-8">عفواً، الصفحة التي تبحث عنها غير موجودة.</p>
    <img
      alt="رجل فضاء تائه"
      className="mx-auto w-1/3 mb-8 rounded-lg shadow-lg"
      src="https://images.unsplash.com/photo-1545496077-f34a05387431" // صورة مختلفة وأوضح
    />
    <Link to="/">
      <Button size="lg">العودة إلى الصفحة الرئيسية</Button>
    </Link>
  </div>
);


// --- المكون الرئيسي للتطبيق ---
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* المسار الرئيسي الذي يحتوي على الـ Layout (الهيدر والفوتر) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
              <Route path="products" element={<AnimatedPage><ProductsPage /></AnimatedPage>} />
              
              {/* --- مسار تفاصيل المنتج (صحيح الآن) --- */}
              <Route path="product/:productId" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              
              <Route path="cart" element={<AnimatedPage><CartPage /></AnimatedPage>} />
              <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
              <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
              <Route path="about" element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              <Route path="contact" element={<AnimatedPage><ContactPage /></AnimatedPage>} />

              {/* --- مسارات محمية تتطلب تسجيل الدخول --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
                <Route path="profile" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
                
                {/* --- مسار صفحة نجاح الطلب (تم تصحيحه) --- */}
                <Route path="order-success/:orderId" element={<AnimatedPage><OrderSuccessPage /></AnimatedPage>} />
                
                {/* --- مسار تتبع الطلب للعميل (جديد) --- */}
                <Route path="order/:orderId" element={<AnimatedPage><OrderDetailsPage /></AnimatedPage>} />
                
                {/* --- مسار تغيير كلمة المرور (جديد) --- */}
                <Route path="change-password" element={<AnimatedPage><ChangePasswordPage /></AnimatedPage>} />
              </Route>

              {/* --- مسار لوحة التحكم المحمي للمسؤولين فقط --- */}
              <Route path="AdminDashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>}>
                  <Route index element={<OrderManagement />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="orders/:orderId" element={<OrderDetailsView />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* مسار الصفحة غير الموجودة */}
              <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
