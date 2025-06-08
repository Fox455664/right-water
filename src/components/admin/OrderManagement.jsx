import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Edit,
  Trash2,
  PackageCheck,
  PackageX,
  Truck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

// utils لتصدير CSV
const exportToCSV = (orders) => {
  if (!orders.length) return;
  const headers = ['رقم الطلب', 'اسم العميل', 'التاريخ', 'الإجمالي (ج.م)', 'الحالة', 'المنتجات'];
  const rows = orders.map((order) => [
    order.id,
    order.customerName,
    new Date(order.date).toLocaleDateString('ar-EG'),
    order.total,
    order.status,
    order.items.map((i) => `${i.name} (x${i.quantity})`).join('; '),
  ]);
  let csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers, ...rows].map((e) => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `orders_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// بيانات الحالة وأيقوناتها وألوانها
const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار', icon: <Loader2 className="h-4 w-4 text-yellow-500" /> },
  { value: 'processing', label: 'قيد المعالجة', icon: <Truck className="h-4 w-4 text-blue-500" /> },
  { value: 'shipped', label: 'تم الشحن', icon: <Truck className="h-4 w-4 text-sky-500" /> },
  { value: 'delivered', label: 'تم التسليم', icon: <PackageCheck className="h-4 w-4 text-green-500" /> },
  { value: 'cancelled', label: 'ملغي', icon: <PackageX className="h-4 w-4 text-red-500" /> },
];

const getStatusStyles = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'shipped':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// ---------------------
// مودال عرض تفاصيل الطلب
// ---------------------
const ViewOrderModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg text-right">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-primary">
            تفاصيل الطلب: {order.id}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>اسم العميل:</strong> {order.customerName}
            <br />
            <strong>التاريخ:</strong>{' '}
            {new Date(order.date).toLocaleDateString('ar-EG')}
            <br />
            <strong>الإجمالي:</strong>{' '}
            {order.total.toLocaleString('ar-EG', {
              style: 'currency',
              currency: 'EGP',
            })}
            <br />
            <strong>الحالة:</strong>{' '}
            <span
              className={`px-2 py-1 rounded-md text-xs ${getStatusStyles(
                order.status
              )}`}
            >
              {statusOptions.find((s) => s.value === order.status)?.label ||
                order.status}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <h4 className="font-semibold mb-2 text-foreground">المنتجات:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} (الكمية: {item.quantity})
              </li>
            ))}
          </ul>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>
            إغلاق
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ---------------------
// مودال تعديل الطلب (الحالة فقط للسهولة)
// ---------------------
const EditOrderModal = ({ order, isOpen, onClose, onSave }) => {
  const [status, setStatus] = useState(order?.status || '');

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  if (!order) return null;

  const handleSave = () => {
    if (status && status !== order.status) {
      onSave(order.id, status);
      onClose(false);
    } else {
      onClose(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md text-right">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-primary">
            تعديل حالة الطلب: {order.id}
          </AlertDialogTitle>
          <AlertDialogDescription>
            اختر حالة جديدة للطلب.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <Select
            value={status}
            onValueChange={setStatus}
            aria-label="اختر حالة الطلب"
          >
            <SelectTrigger className={`w-full text-xs h-9 ${getStatusStyles(status)}`}>
              <div className="flex items-center">
                {statusOptions.find((s) => s.value === status)?.icon}
                <span className="mr-2">
                  <SelectValue />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  <div className="flex items-center">
                    {option.icon} <span className="mr-2">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter className="flex-row-reverse">
          <AlertDialogAction
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            حفظ التغيير
          </AlertDialogAction>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ---------------------
// المكون الرئيسي
// ---------------------
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editOrder, setEditOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // استمع على تحديثات الطلبات الحية
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error('خطأ في تحميل الطلبات من Firebase:', err);
        setError('حدث خطأ أثناء تحميل الطلبات من الخادم.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // تحديث حالة الطلب في Firestore
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: '✅ تم تحديث حالة الطلب',
        description: `تم تغيير حالة الطلب ${orderId} إلى ${statusOptions.find((s) => s.value === newStatus)?.label || newStatus}.`,
        className: 'bg-green-500 text-white',
      });
    } catch (error) {
      toast({
        title: '❌ حدث خطأ',
        description: 'لم نتمكن من تحديث حالة الطلب. حاول مرة أخرى.',
        className: 'bg-red-600 text-white',
      });
      console.error(error);
    }
  };

  // حذف الطلب من Firestore
  const deleteOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      toast({
        title: '🗑️ تم حذف الطلب',
        description: `تم حذف الطلب ${orderId} بنجاح.`,
        className: 'bg-red-500 text-white',
      });
      setDeleteOrderId(null);
    } catch (error) {
      toast({
        title: '❌ حدث خطأ',
        description: 'لم نتمكن من حذف الطلب. حاول مرة أخرى.',
        className: 'bg-red-600 text-white',
      });
      console.error(error);
    }
  };

  // فلترة الطلبات بناءً على البحث (رقم الطلب أو اسم العميل)
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-primary">إدارة الطلبات</h2>

      {/* شريط البحث وتصدير CSV */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input
          type="search"
          placeholder="ابحث برقم الطلب أو اسم العميل"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs text-right"
          aria-label="بحث الطلبات"
        />
        <Button
          onClick={() => exportToCSV(filteredOrders)}
          variant="outline"
          size="sm"
          className="ml-auto"
          aria-label="تصدير الطلبات إلى CSV"
        >
          تصدير CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            حاول مرة أخرى
          </Button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          لا توجد طلبات لعرضها حالياً.
        </p>
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/40">
                  <TableCell className="text-right">{order.id}</TableCell>
                  <TableCell className="text-right">{order.customerName}</TableCell>
                  <TableCell className="text-right">
                    {new Date(order.date).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.total.toLocaleString('ar-EG', {
                      style: 'currency',
                      currency: 'EGP',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${getStatusStyles(
                        order.status
                      )}`}
                      aria-label={`حالة الطلب: ${
                        statusOptions.find((s) => s.value === order.status)?.label ||
                        order.status
                      }`}
                    >
                      {
                        statusOptions.find((s) => s.value === order.status)?.icon
                      }
                      <span className="mr-1">
                        {statusOptions.find((s) => s.value === order.status)?.label ||
                          order.status}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="عرض الطلب"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsViewModalOpen(true);
                      }}
                      aria-label={`عرض تفاصيل الطلب ${order.id}`}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="تعديل حالة الطلب"
                      onClick={() => {
                        setEditOrder(order);
                        setIsEditModalOpen(true);
                      }}
                      aria-label={`تعديل حالة الطلب ${order.id}`}
                    >
                      <Edit className="h-5 w-5 text-primary" />
                    </Button>

                    <AlertDialog
                      open={deleteOrderId === order.id}
                      onOpenChange={() => setDeleteOrderId(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="حذف الطلب"
                          aria-label={`حذف الطلب ${order.id}`}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md text-right">
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            حذف الطلب <strong>{order.id}</strong> لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse">
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => deleteOrder(order.id)}
                          >
                            حذف
                          </AlertDialogAction>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* مودال عرض الطلب */}
      <ViewOrderModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={setIsViewModalOpen}
      />

      {/* مودال تعديل الطلب */}
      <EditOrderModal
        order={editOrder}
        isOpen={isEditModalOpen}
        onClose={setIsEditModalOpen}
        onSave={updateOrderStatus}
      />
    </motion.div>
  );
};

export default OrderManagement;
