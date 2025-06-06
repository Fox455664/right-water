import React, { useEffect, useState } from 'react';
import { db } from '@/firebase'; // تأكد أنك عرّفت firebase وصدّرت db
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, Settings, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeProducts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => doc.data());
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      const usersSnap = await getDocs(collection(db, 'users'));
      const productsSnap = await getDocs(collection(db, 'products'));
      const activeProducts = productsSnap.docs.filter(doc => doc.data().active === true).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: usersSnap.size,
        activeProducts
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "إجمالي الطلبات", value: stats.totalOrders, icon: <ShoppingBag className="h-6 w-6 text-primary" />, id: "totalOrders" },
    { title: "إجمالي الإيرادات (ج.م)", value: stats.totalRevenue.toLocaleString(), icon: <DollarSign className="h-6 w-6 text-green-500" />, id: "totalRevenue" },
    { title: "عدد المستخدمين", value: stats.totalUsers, icon: <Users className="h-6 w-6 text-purple-500" />, id: "totalUsers" },
    { title: "منتجات نشطة", value: stats.activeProducts, icon: <Package className="h-6 w-6 text-orange-500" />, id: "activeProducts" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-primary text-center">لوحة تحكم المسؤول</h1>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
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
          <TabsTrigger value="ordersView" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center py-2.5">
            <FileText className="ml-2 h-5 w-5" /> عرض الطلبات
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center py-2.5">
            <Package className="ml-2 h-5 w-5" /> إدارة المنتجات
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center py-2.5 col-span-2 md:col-span-1">
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
              <p className="text-muted-foreground">سيتم عرض إعدادات الموقع قريبًا.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboardPage;
