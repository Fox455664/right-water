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
  // ... هنا كل الكود اللي أرسلته بدون تغيير ...

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
          {/* حقول الفورم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="lastName">اسم العائلة</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="postalCode">الرمز البريدي</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* اختيار طريقة الدفع */}
          <div>
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-2 rounded border border-gray-300"
            >
              <option value="cod">الدفع عند الاستلام</option>
              <option value="online">الدفع الإلكتروني</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> جاري الإرسال...
              </>
            ) : (
              'إتمام الطلب'
            )}
          </Button>
        </motion.form>

        {/* بطاقة ملخص الطلب */}
        <Card className="bg-card/80 rounded-xl shadow-2xl glassmorphism-card">
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>{(item.price * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-semibold">
              <span>المجموع الفرعي:</span>
              <span>{subTotalForDisplay.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
            </div>
            <div className="flex justify-between">
              <span>تكلفة الشحن:</span>
              <span>{shippingCost.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{totalForDisplay.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
