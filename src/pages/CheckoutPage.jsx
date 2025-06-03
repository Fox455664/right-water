import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Lock, ArrowRight, Info, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { cartItems: contextCartItems, clearCart } = useCart();

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
    let currentCartItems = [];
    let currentTotal = 0;
    let source = "unknown";

    if (location.state && location.state.cartItems && typeof location.state.total === 'number') {
      currentCartItems = location.state.cartItems;
      currentTotal = location.state.total;
      source = "location.state";
    } else if (contextCartItems && contextCartItems.length > 0) {
      currentCartItems = contextCartItems;
      const subtotal = contextCartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      const shipping = subtotal > 0 ? 50 : 0; 
      currentTotal = subtotal + shipping;
      source = "contextCartItems";
    }
    
    setCartItems(currentCartItems);
    setTotal(currentTotal);
    setIsLoadingData(false);

    if (currentCartItems.length === 0 && !isLoadingData) {
        toast({
            title: "سلة التسوق فارغة",
            description: "يبدو أن سلتك فارغة. يتم توجيهك لصفحة المنتجات.",
            variant: "default",
            duration: 4000,
        });
        setTimeout(() => navigate('/products'), 1500);
    }

  }, [location.state, contextCartItems, navigate, toast, isLoadingData]);


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
        ...formData,
        cartItems: cartItems.map(item => ({ 
          id: item.id, 
          name: item.name, 
          quantity: item.quantity, 
          price: item.price,
          image: item.image || null 
        })),
        totalAmount: total,
        status: 'pending', 
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      const emailParams = {
        to_name: `${formData.firstName} ${formData.lastName}`,
        to_email: formData.email,
        from_name: "متجر Right Water",
        order_id: docRef.id,
        order_total: total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}`,
        order_items: cartItems.map(item => `${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}`).join('\n'),
        customer_phone: formData.phone,
        payment_method: "الدفع عند الاستلام",
      };
      
      try {
        await emailjs.send('service_pllfmfx', 'template_z9q8e8p', { ...emailParams, merchant_email: 'merchant@rightwater.com' }, 'xpSKf6d4h11LzEOLz');
        await emailjs.send('service_pllfmfx', 'template_client', emailParams, 'xpSKf6d4h11LzEOLz');
      } catch (emailError) {
        console.warn("EmailJS error: ", emailError);
        toast({
            title: "خطأ في إرسال البريد",
            description: "تم تسجيل طلبك بنجاح، ولكن حدث خطأ أثناء إرسال بريد التأكيد. سنتواصل معك قريباً.",
            variant: "default",
            duration: 5000,
        });
      }
      
      toast({
        title: "🎉 تم إرسال طلبك بنجاح!",
        description: `شكراً لك ${formData.firstName}. رقم طلبك هو: ${docRef.id}`,
        className: "bg-green-500 text-white",
        duration: 7000,
      });

      clearCart();
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
                يبدو أنك لم تختر أي كنوز مائية بعد. ابدأ رحلتك نحو مياه أنقى الآن!
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
          className="lg:col-span-2 space-y-8 p-6 md:p-8 bg-card/80 rounded-xl shadow-2xl glassmorphism-card"
        >
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">1. معلومات الشحن</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-foreground">الاسم الأول</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-foreground">الاسم الأخير</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
              </div>
            </div>
            <div className="mt-6">
              <Label htmlFor="email" className="text-foreground">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
            </div>
            <div className="mt-6">
              <Label htmlFor="phone" className="text-foreground">رقم الهاتف</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
            </div>
            <div className="mt-6">
              <Label htmlFor="address" className="text-foreground">العنوان بالتفصيل</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" placeholder="مثال: شارع النيل، مبنى رقم 5، شقة 10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label htmlFor="city" className="text-foreground">المدينة</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-foreground">الرمز البريدي (اختياري)</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="mt-1 bg-background/70 border-primary/30 focus:border-primary" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">2. طريقة الدفع</h2>
            <div className="p-4 border border-primary/30 rounded-md bg-primary/5">
              <Label htmlFor="cod" className="flex items-center cursor-pointer">
                <Input type="radio" id="cod" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="ml-2 accent-primary" />
                <span className="text-lg font-medium text-foreground">الدفع عند الاستلام</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-2 ml-6">
                سيتم تحصيل المبلغ نقدًا عند توصيل الطلب. يرجى تجهيز المبلغ المطلوب.
              </p>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-3 mt-8" disabled={isSubmitting || cartItems.length === 0}>
            {isSubmitting ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Lock className="ml-2 h-5 w-5" />}
            {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب والدفع'}
          </Button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 glassmorphism-card shadow-xl sticky top-24">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-primary text-center">ملخص طلبك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-0 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {cartItems.length > 0 ? cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-border/30 last:border-b-0">
                  <div className="flex items-center">
                    <img-replace alt={item.name || "صورة منتج"} className="w-12 h-12 object-cover rounded-md mr-3 ml-3 shadow-sm" src={item.image || "https://images.unsplash.com/photo-1587017098860-21f88e2912f3"}/>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-foreground font-medium">{(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                </div>
              )) : (
                 <div className="text-center py-6">
                    <Info className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-muted-foreground">سلتك فارغة حالياً.</p>
                    <Button variant="link" onClick={() => navigate('/products')} className="text-primary p-0 h-auto mt-2">
                        ابدأ التسوق <ArrowRight className="mr-1 h-4 w-4" />
                    </Button>
                 </div>
              )}
            </CardContent>
            {cartItems.length > 0 && (
              <CardFooter className="p-0 mt-6 flex flex-col space-y-3 border-t border-border/50 pt-4">
                <div className="flex justify-between w-full text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{subTotalForDisplay.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <div className="flex justify-between w-full text-muted-foreground">
                  <span>الشحن</span>
                  <span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
                <hr className="my-2 w-full border-border/50" />
                <div className="flex justify-between w-full text-xl font-bold text-foreground">
                  <span>الإجمالي الكلي</span>
                  <span>{totalForDisplay.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;