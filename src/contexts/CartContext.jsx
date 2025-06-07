import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  // تحميل البيانات من localStorage بأمان
  useEffect(() => {
    try {
      const localCart = localStorage.getItem('cartItems');
      setCartItems(localCart ? JSON.parse(localCart) : []);
    } catch (error) {
      setCartItems([]);
      console.error("خطأ في قراءة بيانات السلة من localStorage:", error);
    }
  }, []);

  // دالة لتحديث الـ state والـ localStorage مرة وحدة
  const updateCart = useCallback((updaterFn) => {
    setCartItems(prevItems => {
      const updatedItems = updaterFn(prevItems);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return updatedItems;
    });
  }, []);

  const addItemToCart = useCallback((productToAdd) => {
    updateCart(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);

      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          const updatedItems = prevItems.map(item =>
            item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
          );
          toast({
            title: "🛒 أضيف إلى السلة!",
            description: `${productToAdd.name} أصبح الآن في سلة التسوق الخاصة بك.`,
            className: "bg-green-500 text-white",
          });
          return updatedItems;
        } else {
          toast({
            title: "كمية غير كافية",
            description: `لا يمكن إضافة المزيد من منتج "${productToAdd.name}". الكمية القصوى في المخزون هي ${productToAdd.stock}.`,
            variant: "destructive",
          });
          return prevItems; 
        }
      } else {
        if (productToAdd.stock > 0) {
          const updatedItems = [...prevItems, { ...productToAdd, quantity: 1 }];
          toast({
            title: "🛒 أضيف إلى السلة!",
            description: `${productToAdd.name} أصبح الآن في سلة التسوق الخاصة بك.`,
            className: "bg-green-500 text-white",
          });
          return updatedItems;
        } else {
          toast({
            title: "نفذ المخزون",
            description: `عفواً، منتج "${productToAdd.name}" غير متوفر حالياً.`,
            variant: "destructive",
          });
          return prevItems;
        }
      }
    });
  }, [toast, updateCart]);

  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      // حذف العنصر إذا الكمية أقل من 1
      removeItemFromCart(itemId);
      return;
    }

    updateCart(prevItems => {
      let hasChanged = false;
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          if (newQuantity > item.stock) {
            toast({
              title: "كمية غير متوفرة",
              description: `الكمية المطلوبة لـ ${item.name} تتجاوز المخزون المتاح (${item.stock}).`,
              variant: "destructive",
            });
            return item;
          }
          if (item.quantity !== newQuantity) {
            hasChanged = true;
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      });

      return hasChanged ? updatedItems : prevItems;
    });
  }, [toast, updateCart]);

  const removeItemFromCart = useCallback((itemId) => {
    updateCart(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      toast({
        title: "🗑️ تم الحذف من السلة",
        description: "تمت إزالة المنتج من سلة التسوق الخاصة بك.",
        className: "bg-red-500 text-white",
      });
      return updatedItems;
    });
  }, [toast, updateCart]);

  const clearCart = useCallback(() => {
    updateCart(() => []);
    // لا توست هنا عادةً
  }, [updateCart]);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const cartCount = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
