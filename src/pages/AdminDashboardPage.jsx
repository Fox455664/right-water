import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // عدل حسب مسار ملفك
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderDetailsView from "@/components/admin/OrderDetailsView";
import ProductManagement from "@/components/admin/ProductManagement";
import { Settings, FileText } from "lucide-react";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. حساب إجمالي الطلبات
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const totalOrders = ordersSnapshot.size;

        // 2. حساب إجمالي الإيرادات (مثلاً مجموع قيمة كل الطلبات)
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const data = doc.data();
          totalRevenue += data.totalPrice || 0; // افترض أن كل طلب يحتوي على totalPrice
        });

        // 3. عدد المستخدمين
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // 4. عدد المنتجات النشطة (مثلاً المنتجات اللي active = true)
        const productsQuery = query(collection(db, "products"), where("active", "==", true));
        const productsSnapshot = await getDocs(productsQuery);
        const activeProducts = productsSnapshot.size;

        setStats({
          totalOrders,
          totalRevenue,
          totalUsers,
          activeProducts,
        });
      } catch (error) {
        console.error("خطأ في جلب الإحصائيات:", error);
      }
    };

    fetchStats();
  }, []);

  // مصفوفة للإحصائيات مع الآيقونات والقيم الحية
  const statsArray = [
    { title: "إجمالي الطلبات", value: stats.totalOrders, icon: <ShoppingBag className="h-6 w-6 text-primary" />, id: "totalOrders" },
    { title: "إجمالي الإيرادات (ج.م)", value: stats.totalRevenue.toLocaleString(), icon: <DollarSign className="h-6 w-6 text-green-500" />, id: "totalRevenue" },
    { title: "عدد المستخدمين", value: stats.totalUsers, icon: <Users className="h-6 w-6 text-purple-500" />, id: "totalUsers" },
    { title: "منتجات نشطة", value: stats.activeProducts, icon: <Package className="h-6 w-6 text-orange-500" />, id: "activeProducts" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">لوحة تحكم المسؤول</h1>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsArray.map((stat, index) => (
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
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
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
              <OrderDetailsView />
            </CardContent>
          </Card>
        </TabsContent>

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
              <p className="text-muted-foreground">سيتم عرض خيارات إعدادات الموقع هنا قريباً (مثل معلومات الاتصال، إعدادات الشحن، إلخ).</p>
              <img
                alt="أيقونات متنوعة تمثل إعدادات مختلفة"
                className="mx-auto mt-4 w-1/2 opacity-70"
                src="https://images.unsplash.com/photo-1630394496594-9ad807386593"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboardPage;
