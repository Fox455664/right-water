// src/components/Navbar.jsx (النسخة النهائية المعدلة)

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogIn, LogOut, ShieldCheck, Droplets, BookOpen, Package, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد مكونات القائمة المنسدلة وبيانات المنتجات
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { productCategories } from "@/data/productsData.jsx";

// مكون مساعد لعرض عناصر القائمة المنسدلة
const ListItem = React.forwardRef(({ className, title, to, ...props }, ref) => {
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
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


const Navbar = () => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // إغلاق القائمة المنسدلة للموبايل عند تغيير الصفحة
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
  
  // تجميع الروابط في متغير لسهولة الاستخدام
  const navLinks = (
    <>
      <Link to="/cart" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
          <ShoppingCart size={20} />
          <span>السلة</span>
          {cartItemCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
      </Link>
      {currentUser ? (
        <>
          {isAdmin && (
            <Link to="/AdminDashboard" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
              <ShieldCheck size={20} />
              <span>لوحة التحكم</span>
            </Link>
          )}
          <Link to="/profile" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
            <User size={20} />
            <span>ملفي الشخصي</span>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-4 py-2 text-foreground/80 hover:text-destructive w-full text-right">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </>
      ) : (
        <Link to="/login" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
          <LogIn size={20} />
          <span>تسجيل الدخول</span>
        </Link>
      )}
    </>
  );


  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-background/80 backdrop-blur-sm shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity" aria-label="الصفحة الرئيسية">
          <Droplets size={32} />
          <h1 className="text-2xl font-bold tracking-tight">رايت واتر</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-2">
            <NavigationMenu>
                <NavigationMenuList>
                    {/* --- القائمة المنسدلة للمنتجات --- */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            <Package className="h-4 w-4 mr-2"/>
                            المنتجات
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {productCategories.map((category) => (
                                <ListItem
                                    key={category.id}
                                    title={category.title}
                                    to={`/products#${category.id}`}
                                >
                                </ListItem>
                            ))}
                        </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    {/* --- زر المقالات --- */}
                    <NavigationMenuItem>
                        <NavLink to="/articles" className={navigationMenuTriggerStyle()}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            مقالات
                        </NavLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center space-x-1">
                {navLinks}
            </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="flex flex-col px-4 pt-2 pb-4 border-t">
              <Link to="/products" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
                <Package size={20} />
                <span>جميع المنتجات</span>
              </Link>
              <Link to="/articles" className="flex items-center gap-4 py-2 text-foreground/80 hover:text-primary">
                <BookOpen size={20} />
                <span>مقالات</span>
              </Link>
              <div className="border-t my-2"></div>
              {navLinks}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
