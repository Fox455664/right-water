import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, ShoppingBag, DollarSign, Settings, Package, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductManagement from '@/components/admin/ProductManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// مكون لعرض الطلبات مع تصفية حسب الحالة
const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, delivered, cancelled, postponed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // تصفية الطلبات حسب الحالة المختارة
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'delivered') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    if (filter === 'postponed') return order.status === 'postponed';
    return true;
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-semibold ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          كل الطلبات
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-md font-semibold ${filter === 'delivered' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
        >
          الطلبات المستلمة
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-md font-semibold ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}
        >
          الطلبات الملغية
        </button>
        <button
          onClick={() => setFilter('postponed')}
          className={`px-4 py-2 rounded-md font-semibold ${filter === 'postponed' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}
        >
          الطلبات المؤجلة
        </button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">...جاري تحميل الطلبات</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-muted-foreground">لا توجد طلبات في هذه الحالة.</p>
      ) : (
        <table className="w-full text-right border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">رقم الطلب</th>
              <th className="border border-gray-300 p-2">اسم العميل</th>
              <th className="border border-gray-300 p-2">المبلغ (ج.م)</th>
              <th className="border border-gray-300 p-2">تاريخ الطلب</th>
              <th className="border border-gray-300 p-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{order.id}</td>
                <td className="border border-gray-300 p-2">{order.customerName || order.customer?.name || 'غير معروف'}</td>
                <td className="border border-gray-300 p-2">{order.total?.toLocaleString() || '0'}</td>
                <td className="border border-gray-300 p-2">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString('ar-EG') || '---'}</td>
                <td className={`border border-gray-300 p-2 font-semibold ${
                  order.status === 'delivered' ? 'text-green-600' :
                  order.status === 'cancelled' ? 'text-red-600' :
                  order.status === 'postponed' ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  {order.status || 'غير معروف'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: "إجمالي الطلبات", value: "0", icon: <ShoppingBag className="h-6 w-6 text-primary" />, id: "totalOrders" },
    { title: "إجمالي الإيرادات (ج.م)", value: "0", icon: <DollarSign className="h-6 w-6 text-green-500" />, id: "totalRevenue" },
    { title: "عدد المستخدمين", value: "0", icon: <Users className="h-6 w-6 text-purple-500" />, id: "totalUsers" },
    { title: "منتجات نشطة", value: "0", icon: <Package className="h-6 w-6 text-orange-500" />, id: "activeProducts" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // الطلبات
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        // المنتجات
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs.map(doc => doc.data());
        const activeProducts = products.filter(p => p.inStock > 0).length;

        // المستخدمين
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // تحديث الإحصائيات
        setStats([
          {
            title: "إجمالي الطلبات",
            value: `${totalOrders}`,
            icon: <ShoppingBag className="h-6 w-6 text-primary" />,
            id: "totalOrders",
          },
          {
            title: "إجمالي الإيرادات (ج.م)",
            value: `${totalRevenue.toLocaleString()}`,
            icon: <DollarSign className="h-6 w-6 text-green-500" />,
            id: "totalRevenue",
          },
          {
            title: "عدد المستخدمين",
            value: `${totalUsers}`,
            icon: <Users className="h-6 w-6 text-purple-500" />,
            id: "totalUsers",
          },
          {
            title: "منتجات نشطة",
            value: `${activeProducts}`,
            icon: <Package className="h-6 w-6 text-orange-500" />,
            id: "activeProducts",
          },
        ]);
      } catch (error) {
        console.error('خطأ أثناء جلب الإحصائيات:', error);
      }
    };

    fetchStats();
  }, []);

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
              <OrdersView />
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
              <img alt="إعدادات الموقع" className="mx-auto mt-4 w-1/2 opacity-70" src="https://images.unsplash.com/photo-1630394496594-9ad807386593" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboardPage;
