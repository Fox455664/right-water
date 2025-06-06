import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ArrowRight, Info, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart(); 

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    setIsLoadingData(true);
    const source = location.state;

    if (source && source.cartItems && Array.isArray(source.cartItems) && typeof source.total === 'number' && source.fromCart) {
      setCartItems(source.cartItems);
      setTotal(source.total);
    } else {
      setCartItems([]);
      setTotal(0);
      if (!source?.fromCart) { 
        toast({
            title: "سلة التسوق فارغة",
            description: "لم يتم العثور على منتجات في السلة. يتم توجيهك لصفحة المنتجات.",
            variant: "default",
            duration: 3000,
        });
        setTimeout(() => navigate('/products'), 1500);
      }
    }
    setIsLoadingData(false);
  }, [location.state, navigate, toast]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "لا يمكنك المتابعة والدفع بسلة فارغة. يرجى إضافة منتجات أولاً.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
    setIsSubmitting(true);

    try {
      const orderData = {
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'Egypt' 
        },
        items: cartItems.map(item => ({ 
          id: item.id, 
          name: item.name, 
          quantity: item.quantity, 
          price: item.price,
          image: item.image || null 
        })),
        totalAmount: total,
        status: 'pending', 
        paymentMethod: formData.paymentMethod,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock;
          const newStock = currentStock - item.quantity;
          await updateDoc(productRef, { stock: newStock < 0 ? 0 : newStock });
        }
      }
      
      const orderItemsHtml = cartItems.map(item => 
        `<div style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
           <span style="flex-grow: 1;">${item.name} (الكمية: ${item.quantity})</span>
           <span style="font-weight: bold;">${(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
         </div>`
      ).join('');

      const emailParams = {
        to_name: `${formData.firstName} ${formData.lastName}`,
        to_email: formData.email,
        from_name: "متجر Right Water",
        support_email: "support@rightwater.com", 
        current_year: new Date().getFullYear(),
        order_id: docRef.id,
        order_total: total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}, مصر`,
        order_items_html: orderItemsHtml,
        customer_phone: formData.phone,
        payment_method: formData.paymentMethod === 'cod' ? "الدفع عند الاستلام" : formData.paymentMethod,
      };
      
      try {
        await emailjs.send('service_pllfmfx', 'template_client', emailParams, 'xpSKf6d4h11LzEOLz');
        await emailjs.send('service_pllfmfx', 'template_z9q8e8p', { ...emailParams, merchant_email: 'merchant@rightwater.com' }, 'xpSKf6d4h11LzEOLz');
      } catch (emailError) {
        console.warn("EmailJS error: ", emailError);
        toast({
            title: "خطأ في إرسال البريد",
            description: "تم تسجيل طلبك بنجاح، ولكن حدث خطأ أثناء إرسال بريد التأكيد. سنتواصل معك قريباً.",
            variant: "default",
            duration: 5000,
        });
      }
      
      clearCart(); 
      
      toast({
        title: "🎉 تم إرسال طلبك بنجاح!",
        description: `شكراً لك ${formData.firstName}. رقم طلبك هو: ${docRef.id}`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });

      navigate('/order-success', { state: { orderId: docRef.id, customerName: formData.firstName, totalAmount: total } });

    } catch (error) {
      console.error("Error placing order: ", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إتمام طلبك. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const shippingCost = cartItems.length > 0 ? 50 : 0;
  const subTotalForDisplay = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const totalForDisplay = subTotalForDisplay + shippingCost;


  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تجهيز صفحة الدفع...</p>
        <p className="text-sm text-muted-foreground">لحظات قليلة ونكون جاهزين!</p>
      </div>
    );
  }
  
  if (cartItems.length === 0 && !isLoadingData) { 
     return (
        <div className="container mx-auto px-4 py-20 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-card/70 p-8 rounded-xl shadow-xl glassmorphism-card"
            >
                <ShoppingBag className="mx-auto h-24 w-24 text-primary mb-6" />
                <h1 className="text-3xl font-bold text-foreground mb-4">سلة التسوق الخاصة بك فارغة</h1>
                <p className="text-muted-foreground mb-8">
                لا يمكنك إتمام الدفع بسلة فارغة. نرجو إضافة منتجات أولاً.
                </p>
                <Button onClick={() => navigate('/products')} size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    <ArrowRight className="mr-2 h-5 w-5" /> اكتشف منتجاتنا
                </Button>
            </motion.div>
        </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          إتمام عملية الدفع
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          يرجى إدخال معلوماتك لإكمال طلبك. خطوة واحدة تفصلك عن مياه نقية!
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-8 p-6 md:p-8 bg-card/80 rounded-xl shadow-2xl glassmorphism-card
