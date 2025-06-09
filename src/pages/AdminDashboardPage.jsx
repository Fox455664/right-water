import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Settings,
  FileText,
  RefreshCw, // 1. استيراد أيقونة التحديث
  Loader2,    // 2. استيراد أيقونة التحميل (spinner)
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductManagement from '@/components/admin/ProductManagement';
// تأكد من أن هذا هو اسم الكمبوننت الصحيح لإدارة الطلبات
import OrderManagement from '@/components/admin/OrderManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs, query, where } from 'firebase/firestore'; // استيراد query و where
import { db } from '@/firebase';
import { Button } from '@/components/ui/button'; // استيراد زر
import { toast } from '@/components/ui/use-toast'; // لاستخدام التنبيهات

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: "إجمالي الطلبات", value: "0", icon: <ShoppingBag className="h-6 w-6 text-primary" />, id: "totalOrders" },
    { title: "إجمالي الإيرادات (ج.م)", value: "0", icon: <DollarSign className="h-6 w-6 text-green-500" />, id: "totalRevenue" },
    { title: "عدد المستخدمين", value: "0", icon: <Users className="h-6 w-6 text-purple-500" />, id: "totalUsers" },
    { title: "منتجات نشطة", value: "0", icon: <Package className="h-6 w-6 text-orange-500" />, id: "activeProducts" },
  ]);

  // 3. إضافة حالة جديدة لتتبع عملية تحميل الإحصائيات
  const [loadingStats, setLoadingStats] = useState(true);

  // 4. تحويل دالة جلب البيانات إلى دالة يمكن استدعاؤها في أي وقت
  // استخدام useCallback لمنع إعادة إنشائها مع كل إعادة رندر إلا عند الضرورة
  const fetchStats = useCallback(async () => {
    setLoadingStats(true); // بدء التحميل
    try {
      // الطلبات والإيرادات
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const totalOrders = orders.length;
      // حساب الإيرادات من الطلبات المكتملة فقط (اختياري لكن أفضل)
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // المنتجات النشطة
      const productsQuery = query(collection(db, 'products'), where('inStock', '>', 0));
      const productsSnapshot = await getDocs(productsQuery);
      const activeProducts = productsSnapshot.size;

      // المستخدمين
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // تحديث الإحصائيات
      setStats([
        { title: "إجمالي الطلبات", value: `${totalOrders}`, icon: <ShoppingBag className="h-6 w-6 text-primary" />, id: "totalOrders" },
        { title: "إجمالي الإيرادات (ج.م)", value: `${totalRevenue.toLocaleString('ar-EG')}`, icon: <DollarSign className="h-6 w-6 text-green-500" />, id: "totalRevenue" },
        { title: "عدد المستخدمين", value: `${totalUsers}`, icon: <Users className="h-6 w-6 text-purple-500" />, id: "totalUsers" },
        { title: "منتجات نشطة", value: `${activeProducts}`, icon: <Package className="h-6 w-6 text-orange-500" />, id: "activeProducts" },
      ]);
      
      // إظهار رسالة نجاح عند التحديث اليدوي (وليس عند التحميل الأول)
      if (!loadingStats) {
        toast({
          title: "تم التحديث",
          description: "تم تحديث الإحصائيات بنجاح.",
        });
      }

    } catch (error) {
      console.error('خطأ أثناء جلب الإحصائيات:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإحصائيات.",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false); // انتهاء التحميل
    }
  }, []); // useCallback سيعيد استخدام نفس الدالة طالما لم تتغير الاعتماديات

  // 5. استدعاء الدالة عند تحميل الصفحة لأول مرة
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-8"
    >
      {/* 6. تعديل هذا الجزء لإضافة زر التحديث */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">لوحة تحكم المسؤول</h1>
        <Button onClick={fetchStats} disabled={loadingStats} variant="outline">
          {loadingStats ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="ml-2 h-4 w-4" />
          )}
          {loadingStats ? 'جارِ التحديث...' : 'تحديث'}
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="glassmorphism-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="ordersView" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-2 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger value="ordersView" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center justify-center py-2.5">
            <FileText className="ml-2 h-5 w-5" /> عرض الطلبات
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center justify-center py-2.5">
            <Package className="ml-2 h-5 w-5" /> إدارة المنتجات
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center justify-center py-2.5 col-span-2 md:col-span-1">
            <Settings className="ml-2 h-5 w-5" /> إعدادات الموقع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ordersView" className="mt-6">
          <Card className="glassmorphism-card shadow-lg">
            <CardContent className="p-4 md:p-6">
              {/* استبدلت الاسم هنا ليتطابق مع ما ناقشناه */}
              <OrderManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* باقي الـ TabsContent كما هي */}
        <TabsContent value="products" className="mt-6">
            <Card className="glassmorphism-card shadow-lg">
                <CardContent className="p-4 md:p-6">
                    <ProductManagement />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
            <Card className="glassmorphism-card shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">إعدادات الموقع</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <p className="text-muted-foreground">سيتم عرض خيارات إعدادات الموقع هنا قريباً.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboardPage;
