import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { db } from "@/src/firebase";
import { addDoc, collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const { cartItems, clearCart, updateStock } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    paymentMethod: "cod",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast({
        title: "سلة التسوق فارغة",
        description: "يرجى إضافة منتجات قبل إتمام الطلب.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // حفظ الطلب في Firestore
      const docRef = await addDoc(collection(db, "orders"), {
        ...formData,
        cartItems,
        total,
        createdAt: new Date(),
      });

      // تحديث المخزون
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const newStock = (productSnap.data().stock || 0) - item.quantity;
          await updateDoc(productRef, { stock: Math.max(newStock, 0) });
          updateStock(item.id, Math.max(newStock, 0));
        }
      }

      // HTML للمنتجات داخل الإيميل
      const orderItemsHtml = cartItems.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.price.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</td>
        </tr>
      `).join('');

      const emailParams = {
        to_name: `${formData.firstName} ${formData.lastName}`,
        to_email: formData.email,
        from_name: "متجر Right Water",
        support_email: "yalqlb019@gmail.com",
        current_year: new Date().getFullYear(),
        order_id: docRef.id,
        order_total: total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' }),
        order_address: `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}, مصر`,
        order_items_html: orderItemsHtml,
        customer_phone: formData.phone,
        payment_method: formData.paymentMethod === 'cod' ? "الدفع عند الاستلام" : formData.paymentMethod,
      };

      try {
        // إرسال البريد للعميل
        await emailjs.send(
          'service_pllfmfx',
          'template_client',
          emailParams,
          'xpSKf6d4h11LzEOLz'
        );

        // إرسال البريد للتاجر
        await emailjs.send(
          'service_pllfmfx',
          'template_z9q8e8p',
          { ...emailParams, merchant_email: 'yalqlb019@gmail.com' },
          'xpSKf6d4h11LzEOLz'
        );

        clearCart();

        toast({
          title: "🎉 تم إرسال طلبك بنجاح!",
          description: `شكراً لك ${formData.firstName}. رقم طلبك هو: ${docRef.id}`,
          className: "bg-green-500 text-white",
          duration: 7000,
        });

        navigate("/order-success", {
          state: {
            orderId: docRef.id,
            customerName: formData.firstName,
            totalAmount: total,
          },
        });
      } catch (emailError) {
        console.warn("EmailJS Error:", emailError);
        toast({
          title: "تم تسجيل الطلب بنجاح",
          description: "لكن واجهنا مشكلة في إرسال بريد التأكيد. سنتواصل معك لاحقاً.",
          variant: "default",
          duration: 5000,
        });

        navigate("/order-success", {
          state: {
            orderId: docRef.id,
            customerName: formData.firstName,
            totalAmount: total,
          },
        });
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر إتمام الطلب. حاول لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="p-4 max-w-2xl mx-auto text-right" 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-bold mb-4">إتمام الطلب</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="الاسم الأول" value={formData.firstName} onChange={handleChange} className="input" required />
          <input type="text" name="lastName" placeholder="الاسم الأخير" value={formData.lastName} onChange={handleChange} className="input" required />
        </div>
        <input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} className="input w-full" required />
        <input type="text" name="phone" placeholder="رقم الهاتف" value={formData.phone} onChange={handleChange} className="input w-full" required />
        <input type="text" name="address" placeholder="العنوان" value={formData.address} onChange={handleChange} className="input w-full" required />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="city" placeholder="المدينة" value={formData.city} onChange={handleChange} className="input" required />
          <input type="text" name="postalCode" placeholder="الرمز البريدي (اختياري)" value={formData.postalCode} onChange={handleChange} className="input" />
        </div>
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="input w-full" required>
          <option value="cod">الدفع عند الاستلام</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full" disabled={isSubmitting}>
          {isSubmitting ? "جارٍ معالجة الطلب..." : "تأكيد الطلب"}
        </button>
      </form>
    </motion.div>
  );
};

export default CheckoutPage;
