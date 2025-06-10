import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { db, doc, getDoc } from '@/lib/firebase';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">عذراً، لم نتمكن من العثور على طلبك</h1>
          <Button asChild>
            <Link to="/">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              شكراً لك على طلبك. سنقوم بمعالجته في أقرب وقت ممكن.
            </p>
            <p className="text-sky-600 dark:text-sky-400 font-medium">
              رقم الطلب: {order.id}
            </p>
          </div>

          <div className="border-t border-b dark:border-slate-700 py-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Package className="mr-2 rtl:ml-2 rtl:mr-0 text-sky-500" />
              تفاصيل الطلب
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">معلومات الشحن</h2>
            <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
              <div>
                <p className="font-medium">الاسم:</p>
                <p>{order.shipping.fullName}</p>
              </div>
              <div>
                <p className="font-medium">رقم الهاتف:</p>
                <p>{order.shipping.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium">العنوان:</p>
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button asChild variant="outline">
              <Link to="/products" className="flex items-center">
                <ArrowRight className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                متابعة التسوق
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/order/${order.id}`}>تتبع الطلب</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
