import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();
  const { cart, clearCart } = useCart();

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
    paymentMethod: 'cod',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/products');
    } else {
      setCartItems(cart);
      const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotal(totalPrice);
    }
  }, [cart]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...formData,
        items: cartItems,
        total,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      // Update stock
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;
          const newStock = Math.max(currentStock - item.quantity, 0);
          await updateDoc(productRef, { stock: newStock });
        }
      }

      // Send Email
      await emailjs.send(
        'service_pllfmfx',
        'template_z9q8e8p',
        {
          to_name: formData.firstName,
          from_name: 'Your Store',
          message: `تم تأكيد طلبك بقيمة ${total} جنيه.`,
          reply_to: formData.email,
        },
        'xpSKf6d4h11LzEOLz'
      );

      toast({ title: 'تم إرسال الطلب بنجاح', variant: 'success' });

      clearCart();
      navigate('/thanks');
    } catch (error) {
      console.error(error);
      toast({ title: 'حدث خطأ أثناء تنفيذ الطلب', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold mb-6">
        <ShoppingBag className="inline-block mr-2" /> إتمام الطلب
      </motion.h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label>الاسم الأول</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>الاسم الأخير</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input name="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>المدينة</Label>
              <Input name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>الرمز البريدي</Label>
              <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              إتمام الطلب
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.price * item.quantity} ج</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold">
              <span>الإجمالي</span>
              <span>{total} ج</span>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CheckoutPage;
