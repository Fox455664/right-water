
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, XCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/orderUtils';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal, getTotal, clearCart, shippingCost } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      updateQuantity(productId, 1);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const handleDirectQuantityInput = (productId, value) => {
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      updateQuantity(productId, 1); 
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const subtotal = getSubtotal();
  const total = getTotal();

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center min-h-[70vh] flex flex-col items-center justify-center"
      >
        <ShoppingCart size={80} className="text-sky-300 dark:text-sky-600 mb-8 animate-bounce" />
        <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-200 mb-4">سلة التسوق فارغة</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          لم تقم بإضافة أي منتجات إلى سلتك بعد. ابدأ التسوق الآن!
        </p>
        <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white btn-glow">
          <Link to="/products">
            <ArrowLeft className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
            العودة إلى المنتجات
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-4xl font-extrabold text-center text-sky-600 dark:text-sky-400 mb-10">سلة التسوق</h1>
        
        <div className="lg:flex lg:space-x-8 rtl:lg:space-x-reverse">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-2/3 space-y-6 mb-8 lg:mb-0"
          >
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rtl:sm:space-x-reverse"
              >
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/100x100'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                 />
                <div className="flex-grow text-center sm:text-right rtl:sm:text-left">
                  <Link to={`/products/${item.id}`} className="text-lg font-semibold text-sky-700 dark:text-sky-300 hover:underline">{item.name}</Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity, -1)} disabled={item.quantity <= 1} className="h-8 w-8 border-sky-300 text-sky-500 hover:bg-sky-50">
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleDirectQuantityInput(item.id, e.target.value)}
                    className="w-16 h-8 text-center dark:bg-slate-700 dark:border-slate-600"
                    min="1"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity, 1)} className="h-8 w-8 border-sky-300 text-sky-500 hover:bg-sky-50">
                    <Plus size={16} />
                  </Button>
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-200 w-24 text-center sm:text-left rtl:sm:text-right">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="حذف المنتج">
                  <Trash2 size={20} />
                </Button>
              </motion.div>
            ))}
            {cartItems.length > 0 && (
              <motion.div 
                className="mt-6 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: cartItems.length * 0.1 + 0.2 }}
              >
                <Button variant="destructive" onClick={clearCart} className="bg-red-500 hover:bg-red-600 text-white">
                  <XCircle size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                  تفريغ السلة
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:w-1/3 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl h-fit sticky top-24"
          >
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6 border-b pb-4 border-slate-200 dark:border-slate-700">ملخص الطلب</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>الشحن</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-800 dark:text-slate-100 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span>الإجمالي</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white btn-glow text-lg py-3"
              onClick={() => navigate('/checkout')}
            >
              <CreditCard className="mr-2 rtl:ml-2 rtl:mr-0" />
              المتابعة للدفع
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
              الضرائب والخصومات (إن وجدت) ستحسب عند الدفع.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CartPage;
