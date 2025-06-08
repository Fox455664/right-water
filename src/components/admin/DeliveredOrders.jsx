import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle } from 'lucide-react';

const DeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersCollection = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersCollection);
        const deliveredOrders = orderSnapshot.docs
          .map(doc => {
            const data = doc.data();
            const date = data.date?.seconds ? new Date(data.date.seconds * 1000) : new Date(data.date);
            return { id: doc.id, ...data, date };
          })
          .filter(order => order.status === 'delivered');
        setOrders(deliveredOrders);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل الطلبات المستلمة.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveredOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل الطلبات المستلمة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-lg text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-primary text-right">الطلبات المستلمة</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد طلبات مستلمة حالياً.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.date.toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{order.total.toLocaleString('ar-EG')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DeliveredOrders;
