import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, PackageCheck, PackageX, Truck, Loader2, AlertTriangle, UserCircle, Mail, MapPin, PhoneCall, CalendarDays, ListOrdered as ListOrderedIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار', icon: <Loader2 className="h-4 w-4 text-yellow-500" /> },
  { value: 'processing', label: 'قيد المعالجة', icon: <Truck className="h-4 w-4 text-blue-500" /> },
  { value: 'shipped', label: 'تم الشحن', icon: <Truck className="h-4 w-4 text-sky-500" /> },
  { value: 'delivered', label: 'تم التسليم', icon: <PackageCheck className="h-4 w-4 text-green-500" /> },
  { value: 'cancelled', label: 'ملغي', icon: <PackageX className="h-4 w-4 text-red-500" /> },
];

const getStatusStyles = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'shipped': return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const OrderDetailsView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(), 
      }));
      setOrders(fetchedOrders);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching orders: ", err);
      setError("حدث خطأ أثناء تحميل الطلبات من قاعدة البيانات.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: "✅ تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}.`,
        className: "bg-green-500 text-white"
      });
    } catch (err) {
      toast({ title: "❌ خطأ في تحديث الحالة", description: err.message, variant: "destructive" });
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل الطلبات...</p></div>;
  }

  if (error) {
    return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <h2 className="text-2xl font-semibold text-primary flex items-center"><ListOrderedIcon className="ml-2 h-6 w-6"/>عرض تفاصيل الطلبات</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد طلبات لعرضها حالياً.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">اسم العميل</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-center">عرض التفاصيل</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <motion.tr key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-primary truncate max-w-[100px]">{order.id}</TableCell>
                  <TableCell>{order.customerInfo?.name || 'غير متوفر'}</TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'غير متوفر'}</TableCell>
                  <TableCell>{(order.totalAmount || 0).toLocaleString('ar-EG')}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                      <SelectTrigger className={`w-[150px] text-xs h-9 ${getStatusStyles(order.status)}`}>
                        <div className="flex items-center">
                          {statusOptions.find(s => s.value === order.status)?.icon}
                          <span className="mr-2"><SelectValue /></span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">
                            <div className="flex items-center">{option.icon} <span className="mr-2">{option.label}</span></div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedOrder && (
         <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-lg text-right sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl text-primary">تفاصيل الطلب: <span className="font-mono text-sm">{selectedOrder.id}</span></DialogTitle>
                    <DialogDescription>
                        <span className={`inline-block px-2 py-1 rounded-md text-xs ${getStatusStyles(selectedOrder.status)}`}>
                            {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="glassmorphism-card">
                        <CardHeader><CardTitle className="text-lg text-primary flex items-center"><UserCircle className="ml-2"/>معلومات العميل</CardTitle></CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><strong><UserCircle className="inline ml-1 h-4 w-4 text-muted-foreground"/>الاسم:</strong> {selectedOrder.customerInfo?.name || 'غير متوفر'}</p>
                            <p><strong><Mail className="inline ml-1 h-4 w-4 text-muted-foreground"/>البريد:</strong> {selectedOrder.customerInfo?.email || 'غير متوفر'}</p>
                            <p><strong><PhoneCall className="inline ml-1 h-4 w-4 text-muted-foreground"/>الهاتف:</strong> {selectedOrder.customerInfo?.phone || 'غير متوفر'}</p>
                            <p><strong><MapPin className="inline ml-1 h-4 w-4 text-muted-foreground"/>العنوان:</strong> {selectedOrder.customerInfo?.address || 'غير متوفر'}, {selectedOrder.customerInfo?.city || ''}, {selectedOrder.customerInfo?.country || ''}</p>
                        </CardContent>
                    </Card>
                     <Card className="glassmorphism-card">
                        <CardHeader><CardTitle className="text-lg text-primary flex items-center"><CalendarDays className="ml-2"/>تفاصيل الطلب</CardTitle></CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><strong>تاريخ الطلب:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short'}) : 'غير متوفر'}</p>
                            <p><strong>طريقة الدفع:</strong> {selectedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : selectedOrder.paymentMethod || 'غير محدد'}</p>
                            <p><strong>الإجمالي الكلي:</strong> <span className="font-bold text-green-600">{(selectedOrder.totalAmount || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</span></p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-2 text-primary flex items-center"><ListOrderedIcon className="ml-2"/>المنتجات المطلوبة:</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 bg-muted/20">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <ul className="space-y-2">
                            {selectedOrder.items.map((item, index) => (
                                <li key={index} className="p-2 border-b last:border-b-0 flex justify-between items-center text-sm bg-background/50 rounded">
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">الكمية: {item.quantity} | السعر: {(item.price || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                                    </div>
                                    <p className="font-semibold text-primary">{((item.price || 0) * item.quantity).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground text-center p-4">لا توجد منتجات في هذا الطلب.</p>}
                    </div>
                </div>
                
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>إغلاق</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default OrderDetailsView;