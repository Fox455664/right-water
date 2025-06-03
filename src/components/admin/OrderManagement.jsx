import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Select component exists
import { Eye, Edit, Trash2, PackageCheck, PackageX, Truck, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Assuming AlertDialog component exists

// You might need to create Select and AlertDialog components if they don't exist.
// Example for Select: src/components/ui/select.jsx
// Example for AlertDialog: src/components/ui/alert-dialog.jsx

const initialOrders = [
  { id: 'order123', customerName: 'أحمد محمود', date: '2025-05-28', total: 1550, status: 'pending', items: [{ name: 'فلتر مياه', quantity: 1 }, { name: 'فلتر دش', quantity: 1}] },
  { id: 'order456', customerName: 'فاطمة علي', date: '2025-05-27', total: 4500, status: 'shipped', items: [{ name: 'محطة تحلية', quantity: 1 }] },
  { id: 'order789', customerName: 'خالد حسين', date: '2025-05-26', total: 350, status: 'delivered', items: [{ name: 'فلتر دش', quantity: 1 }] },
  { id: 'order101', customerName: 'سارة إبراهيم', date: '2025-05-25', total: 25000, status: 'cancelled', items: [{ name: 'نظام صناعي', quantity: 1 }] },
];

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


const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // const ordersCollection = collection(db, 'orders');
        // const orderSnapshot = await getDocs(ordersCollection);
        // const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // For now, using initialOrders as Firebase 'orders' collection might not exist or be populated
        // if (orderList.length > 0) {
        //   setOrders(orderList);
        // } else {
          setOrders(initialOrders);
          console.warn("Using initial placeholder data for orders. Firebase 'orders' collection might be empty or not found.");
        // }
      } catch (err) {
        console.error("Error fetching orders: ", err);
        setError("حدث خطأ أثناء تحميل الطلبات. سنستخدم بيانات مبدئية.");
        setOrders(initialOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // In a real app, update Firebase
    // const orderRef = doc(db, 'orders', orderId);
    // await updateDoc(orderRef, { status: newStatus });
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
      title: "✅ تم تحديث حالة الطلب",
      description: `تم تغيير حالة الطلب ${orderId} إلى ${statusOptions.find(s=>s.value === newStatus)?.label || newStatus}.`,
      className: "bg-green-500 text-white"
    });
  };

  const handleDeleteOrder = async (orderId) => {
    // In a real app, delete from Firebase
    // await deleteDoc(doc(db, 'orders', orderId));
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    toast({
      title: "🗑️ تم حذف الطلب",
      description: `تم حذف الطلب ${orderId} بنجاح.`,
      className: "bg-red-500 text-white"
    });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">حاول مرة أخرى</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-primary">إدارة الطلبات</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">لا توجد طلبات لعرضها حالياً.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-primary">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>{order.total.toLocaleString('ar-EG')}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      >
                        <SelectTrigger className={`w-[150px] text-xs h-9 ${getStatusStyles(order.status)}`}>
                           <div className="flex items-center">
                            {statusOptions.find(s => s.value === order.status)?.icon}
                            <span className="mr-2"><SelectValue /></span>
                           </div>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              <div className="flex items-center">
                                {option.icon} <span className="mr-2">{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center space-x-1 space-x-reverse">
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-5 w-5" />
                        </Button>
                        {/* <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-700">
                          <Edit className="h-5 w-5" />
                        </Button> */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="text-right">
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الطلب ({order.id}) بشكل دائم.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row-reverse">
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive hover:bg-destructive/90">
                                نعم، حذف الطلب
                              </AlertDialogAction>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
         <AlertDialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <AlertDialogContent className="max-w-lg text-right">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl text-primary">تفاصيل الطلب: {selectedOrder.id}</AlertDialogTitle>
                    <AlertDialogDescription>
                        <strong>اسم العميل:</strong> {selectedOrder.customerName}<br/>
                        <strong>التاريخ:</strong> {new Date(selectedOrder.date).toLocaleDateString('ar-EG')}<br/>
                        <strong>الإجمالي:</strong> {selectedOrder.total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}<br/>
                        <strong>الحالة:</strong> <span className={`px-2 py-1 rounded-md text-xs ${getStatusStyles(selectedOrder.status)}`}>
                            {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                    <h4 className="font-semibold mb-2 text-foreground">المنتجات:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {selectedOrder.items.map((item, index) => (
                            <li key={index}>{item.name} (الكمية: {item.quantity})</li>
                        ))}
                    </ul>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsViewModalOpen(false)}>إغلاق</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </motion.div>
  );
};

export default OrderManagement;