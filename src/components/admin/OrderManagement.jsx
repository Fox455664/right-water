'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Trash2, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // تحميل الطلبات من Firestore
  const loadOrders = async () => {
    const ordersCollection = collection(db, 'orders');
    const snapshot = await getDocs(ordersCollection);
    const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(orderList);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      default: return 'غير معروف';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    toast({
      title: 'تم تحديث حالة الطلب',
      description: `تم تغيير حالة الطلب ${orderId} إلى ${getStatusText(newStatus)}`,
    });
  };

  const deleteOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId));
    setOrders(prev => prev.filter(order => order.id !== orderId));

    toast({
      title: 'تم حذف الطلب',
      description: `تم حذف الطلب ${orderId} بنجاح`,
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* إحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(orderStats).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {key === 'total' ? 'إجمالي الطلبات' :
                   key === 'pending' ? 'قيد الانتظار' :
                   key === 'shipped' ? 'تم الشحن' : 'تم التوصيل'}
                </p>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* البحث */}
      <div className="flex justify-end">
        <Input
          placeholder="ابحث عن اسم العميل أو البريد"
          className="w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* جدول الطلبات */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.customerEmail}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'pending' ? 'destructive' :
                    order.status === 'shipped' ? 'secondary' : 'default'
                  }>
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>{order.total} ر.س</TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تفاصيل الطلب</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-2 text-sm">
                          <p><strong>العميل:</strong> {selectedOrder.customerName}</p>
                          <p><strong>البريد:</strong> {selectedOrder.customerEmail}</p>
                          <p><strong>العنوان:</strong> {selectedOrder.shippingAddress}</p>
                          <p><strong>المنتجات:</strong></p>
                          <ul className="list-disc ps-5">
                            {selectedOrder.items?.map((item, index) => (
                              <li key={index}>{item.name} × {item.quantity}</li>
                            ))}
                          </ul>
                          <p><strong>الحالة:</strong> {getStatusText(selectedOrder.status)}</p>
                          <p><strong>الإجمالي:</strong> {selectedOrder.total} ر.س</p>
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}>تحديث إلى تم الشحن</Button>
                            <Button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} variant="outline">تحديث إلى تم التوصيل</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="icon" onClick={() => deleteOrder(order.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
