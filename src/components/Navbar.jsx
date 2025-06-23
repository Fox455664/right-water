// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogIn, LogOut, ShieldCheck, Droplets, BookOpen, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

// 🔥🔥 استيراد مكونات القائمة المنسدلة وبيانات المنتجات 🔥🔥
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { productCategories } from "@/data/productsData";

// 🔥🔥 مكون مساعد لعرض عناصر القائمة المنسدلة 🔥🔥
const ListItem = React.forwardRef(({ className, title, children, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


const Navbar = () => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItemCount(cartItems.reduce((total, item) => total + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح!",
        description: "نأمل رؤيتك مرة أخرى قريباً.",
        variant: "default",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-water-blue to-water-green/80 shadow-lg sticky top-0 z-50 py-3 px-4 md:px-8"
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity" aria-label="الصفحة الرئيسية">
          <Droplets size={36} className="text-white" />
          <h1 className="text-2xl font-bold tracking-tight">رايت واتر</h1>
        </Link>

        {/* 🔥🔥 تم تعديل هذا الجزء بالكامل 🔥🔥 */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {/* --- القائمة المنسدلة للمنتجات --- */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/20 focus:bg-white/20 data-[state=open]:bg-white/20">
                    <Package className="h-4 w-4 md:mr-2"/>
                    <span className="hidden md:inline">المنتجات</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {productCategories.map((category) => (
                      <ListItem
                        key={category.id}
                        title={category.title}
                        to={`/products/${category.id}`} // رابط ديناميكي لكل فئة
                      >
                        تصفح جميع منتجات فئة {category.title}.
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* --- زر المقالات --- */}
              <NavigationMenuItem>
                  <NavLink to="/articles" className={`${navigationMenuTriggerStyle()} text-white bg-transparent hover:bg-white/20 focus:bg-white/20`}>
                      <BookOpen className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">مقالات</span>
                  </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* --- أيقونات السلة والمستخدم --- */}
          <Link to="/cart">
            <Button aria-label="السلة" variant="ghost" className="text-white hover:bg-white/20 relative px-2 sm:px-3">
              <ShoppingCart size={20} />
              <span className="ml-1 hidden md:inline">السلة</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-h-4 min-w-4 px-[4px] flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {currentUser ? (
            <>
              {isAdmin && (
                <Link to="/AdminDashboard">
                  <Button aria-label="لوحة التحكم" variant="ghost" className="text-white hover:bg-white/20 px-2 sm:px-3">
                    <ShieldCheck size={20} />
                    <span className="ml-1 hidden md:inline">التحكم</span>
                  </Button>
                </Link>
              )}

              <Link to="/profile">
                <Button aria-label="الملف الشخصي" variant="ghost" className="text-white hover:bg-white/20 px-2 sm:px-3">
                  <User size={20} />
                  <span className="ml-1 hidden md:inline">ملفي</span>
                </Button>
              </Link>
              <Button aria-label="تسجيل الخروج" variant="ghost" onClick={handleSignOut} className="text-white hover:bg-white/20 px-2 sm:px-3">
                <LogOut size={20} />
                <span className="ml-1 hidden md:inline">خروج</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button aria-label="تسجيل الدخول" variant="outline" className="text-white border-white hover:bg-white hover:text-primary px-2 sm:px-3">
                <LogIn size={20} />
                <span className="ml-1">دخول</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
