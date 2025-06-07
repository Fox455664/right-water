import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  // تحميل السلة من localStorage عند بدء التشغيل
  useEffect(() => {
    const localCart = localStorage.getItem('cartItems');
    setCartItems(localCart ? JSON.parse(localCart) : []);
  }, []);

  // تحديث السلة وتخزينها في localStorage
  const updateLocalStorageAndNotify = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    setCartItems(items);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  // إضافة عنصر للسلة
  const addItemToCart = useCallback((productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productToAdd.id);
      let updatedItems;

      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          updatedItems = prevItems.map((item) =>
            item.id === productToAdd.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast({
            title: 'كمية غير كافية',
            description: `لا يمكن إضافة المزيد من منتج "${productToAdd.name}". الكمية القصوى في المخزون هي ${productToAdd.stock}.`,
            variant: 'destructive',
          });
          return prevItems;
        }
      } else {
        if (productToAdd.stock > 0) {
          updatedItems = [...prevItems, { ...productToAdd, quantity: 1 }];
        } else {
          toast({
            title: 'نفدت الكمية',
            description: `المنتج "${productToAdd.name}" غير متوفر حالياً.`,
            variant: 'destructive',
          });
          return prevItems;
        }
      }

      updateLocalStorageAndNotify(updatedItems);
      return updatedItems;
    });
  }, [toast]);

  // إزالة عنصر من السلة
  const removeItemFromCart = useCallback((productId) => {
    const updatedItems = cartItems.filter((item) => item.id !== productId);
    updateLocalStorageAndNotify(updatedItems);
  }, [cartItems]);

  // تفريغ السلة
  const clearCart = () => {
    updateLocalStorageAndNotify([]);
  };

  // حساب الإجمالي
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        addItemToCart,
        removeItemFromCart,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
