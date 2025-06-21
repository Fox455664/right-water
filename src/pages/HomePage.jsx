// src/pages/HomePage.jsx (النسخة النهائية بدون صورة poster)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets, ShieldCheck, Zap, Users, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { db, collection, query, limit, getDocs } from '@/firebase';

// استيراد الفيديو فقط
import heroVideo from '@/assets/videos/hero-video.mp4';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    <Card className="text-center h-full glassmorphism-card hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-gradient-to-br from-primary to-secondary text-white rounded-full p-4 w-fit mb-4">
          {icon}
        </div>
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-foreground/80 text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(3));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedProducts(productsList);
      } catch (error) {
        console.error("Error fetching featured products: ", error);
        setProductsError("لم نتمكن من تحميل المنتجات المميزة.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="space-y-16">
      <motion.section 
        className="relative flex items-center justify-center text-center h-[60vh] md:h-[70vh] rounded-xl shadow-lg overflow-hidden"
      >
        {/* 🔥🔥 التعديل هنا: تم حذف خاصية poster 🔥🔥 */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={heroVideo} type="video/mp4" />
          متصفحك لا يدعم عرض الفيديوهات.
        </video>
        
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

        <div className="relative z-20 container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-block p-4 bg-white/20 rounded-full mb-4 shadow-md backdrop-blur-sm">
            <Droplets size={48} className="text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
            مياه نقية لحياة صحية مع رايت ووتر
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
            نقدم حلولاً مبتكرة لمعالجة المياه تضمن لك ولعائلتك مياهاً آمنة.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            <Link to="/products">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-5 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                اكتشف منتجاتنا
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">لماذا تختار رايت ووتر؟</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Droplets size={40} />} title="جودة لا تضاهى" description="نستخدم أحدث التقنيات لضمان أعلى معايير نقاء المياه." delay={0.2}/>
            <FeatureCard icon={<ShieldCheck size={40} />} title="حلول موثوقة" description="منتجاتنا مصممة لتدوم طويلاً وتوفر أداءً يمكن الاعتماد عليه." delay={0.4}/>
            <FeatureCard icon={<Zap size={40} />} title="تركيب سريع" description="فريقنا المحترف يضمن تركيباً سلساً وفعالاً لأنظمتنا." delay={0.6}/>
            <FeatureCard icon={<Users size={40} />} title="دعم فني متميز" description="نقدم دعماً فنياً شاملاً وخدمة عملاء استثنائية." delay={0.8}/>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-secondary to-primary text-white p-10 rounded-xl shadow-xl text-center md:text-right">
            <div className="md:flex md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                    <h2 className="text-3xl font-bold mb-3">هل أنت مستعد لتحسين جودة مياهك؟</h2>
                    <p className="text-lg opacity-90">تواصل معنا اليوم للحصول على استشارة مجانية واكتشف الحل الأمثل لاحتياجاتك.</p>
                </div>
                <Link to="/contact">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 rounded-full transform hover:scale-105 transition-transform duration-300">اتصل بنا الآن</Button>
                </Link>
            </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-center mb-8 text-primary">منتجاتنا المميزة</h2>
        {loadingProducts ? (
            <div className="flex justify-center items-center h-56"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : productsError ? (
            <div className="text-red-500 bg-red-100 p-4 rounded-md flex items-center justify-center gap-2"><AlertTriangle /> {productsError}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <motion.div key={product.id} whileHover={{ y: -10 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        <Link to="/products" className="mt-10 inline-block">
          <Button size="lg" variant="link" className="text-primary text-lg hover:text-secondary">
            عرض جميع المنتجات →
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
