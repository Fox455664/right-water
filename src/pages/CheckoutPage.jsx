import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase"; // تأكد من مسار إعداد Firebase عندك
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2, Lock } from "lucide-react";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("سلة التسوق فارغة!");
      return;
    }

    setIsSubmitting(true);

    try {
      // تحقق من وجود المنتج وكميته في المخزون قبل الحفظ
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          toast.error(`المنتج "${item.name}" غير موجود.`);
          setIsSubmitting(false);
          return;
        }

        const productData = productSnap.data();
        if (productData.stock < item.quantity) {
          toast.error(`الكمية المطلوبة من "${item.name}" غير متوفرة.`);
          setIsSubmitting(false);
          return;
        }
      }

      // حفظ الطلب في Firestore
      const orderData = {
        customer: formData,
        items: cartItems,
        total,
        status: "جديد",
        createdAt: new Date(),
      };

      const ordersCollection = collection(db, "orders");
      const docRef = await addDoc(ordersCollection, orderData);

      // تحديث مخزون المنتجات
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();

        await updateDoc(productRef, {
          stock: productData.stock - item.quantity,
        });
      }

      // إرسال إيميلات عبر EmailJS
      const emailParams = {
        to_email: formData.email,
        to_name: `${formData.firstName} ${formData.lastName}`,
        order_id: docRef.id,
        total: total.toLocaleString("ar-EG", {
          style: "currency",
          currency: "EGP",
        }),
      };

      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        emailParams,
        "YOUR_PUBLIC_KEY"
      );

      toast.success("تم إرسال الطلب بنجاح!");
      clearCart();
      navigate("/thank-you");
    } catch (error) {
      console.error("حدث خطأ في عملية الدفع:", error);
      toast.error("حدث خطأ أثناء معالجة طلبك، حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full bg-card/70 p-8 rounded-xl shadow-xl glassmorphism-card"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-4 text-center">
              إتمام عملية الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="ادخل الاسم الأول"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="ادخل اسم العائلة"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0123456789"
                />
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="شارع، عمارة، رقم"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="القاهرة"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">الرمز البريدي</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="cod">الدفع عند الاستلام</option>
                    <option value="credit_card">بطاقة ائتمان</option>
                    <option value="paypal">باي بال</option>
                  </select>
                </div>
              </div>

              <div className="text-lg font-semibold text-right">
                المجموع النهائي:{" "}
                {total.toLocaleString("ar-EG", {
                  style: "currency",
                  currency: "EGP",
                })}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" /> جاري إرسال الطلب...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" /> تأكيد الدفع
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
