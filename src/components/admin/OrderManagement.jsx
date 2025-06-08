import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Trash2,
  PackageCheck,
  PackageX,
  Truck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
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
} from "@/components/ui/alert-dialog";

const statusOptions = [
  { value: "pending", label: "قيد الانتظار", icon: <Loader2 className="h-4 w-4 text-yellow-500" /> },
  { value: "processing", label: "قيد المعالجة", icon: <Truck className="h-4 w-4 text-blue-500" /> },
  { value: "shipped", label: "تم الشحن", icon: <Truck className="h-4 w-4 text-sky-500" /> },
  { value: "delivered", label: "تم التسليم", icon: <PackageCheck className="h-4 w-4 text-green-500" /> },
  { value: "cancelled", label: "ملغي", icon: <PackageX className="h-4 w-4 text-red-500" /> },
  { value: "delayed", label: "مؤجل", icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "shipped":
      return "bg-sky-100 text-sky-700 border-sky-300";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    case "delayed":
      return "bg-orange-100 text-orange-700 border-orange-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const statusCollections = {
  cancelled: "cancelledOrders",
  delayed: "delayedOrders",
  delivered: "deliveredOrders",
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // الاستماع لمجموعة orders الحية
    const ordersRef = collection(db, "orders");
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setOrders(list);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في تحميل الطلبات:", err);
        setError("حدث خطأ أثناء تحميل الطلبات.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        toast({
          title: "خطأ",
          description: "الطلب غير موجود",
          className: "bg-red-500 text-white",
        });
        return;
      }
      const orderData = orderSnap.data();

      if (["cancelled", "delayed", "delivered"].includes(newStatus)) {
        // حذف من orders
        await deleteDoc(orderRef);
        // إضافة إلى المجموعة الخاصة بالحالة الجديدة
        const targetCollection = statusCollections[newStatus];
        await addDoc(collection(db, targetCollection), {
          ...orderData,
          status: newStatus,
          updatedAt: new Date(),
        });
      } else {
        // تحديث الحالة داخل orders
        await updateDoc(orderRef, {
          status: newStatus,
          updatedAt: new Date(),
        });
      }

      toast({
        title: "تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${statusOptions.find(s => s.value === newStatus)?.label || newStatus}.`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الحالة.",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast({
        title: "تم حذف الطلب",
        description: `تم حذف الطلب ${orderId} بنجاح.`,
        className: "bg-red-500 text-white",
      });
    } catch (error) {
      console.error("خطأ في حذف الطلب:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الطلب.",
        className: "bg-red-500 text-white",
      });
    }
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
        <Button onClick={() => window.location.reload()} className="mt-4">
          حاول مرة أخرى
        </Button>
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
                    <TableCell>{new Date(order.date).toLocaleDateString("ar-EG")}</TableCell>
                    <TableCell>{order.total.toLocaleString("ar-EG")}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      >
                        <SelectTrigger
                          className={`w-[150px] text-xs h-9 ${getStatusStyles(order.status)}`}
                        >
                          <div className="flex items-center">
                            {statusOptions.find((s) => s.value === order.status)?.icon}
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
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center space-x-1 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="text-right">
                            <AlertDialogHeader>
                              <<AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف الطلب رقم {selectedOrder?.id}؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleDeleteOrder(selectedOrder.id);
                                }}
                              >
                                حذف
                              </AlertDialogAction>
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

      {/* مودال عرض تفاصيل الطلب */}
      {isViewModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setIsViewModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">تفاصيل الطلب رقم {selectedOrder.id}</h3>
            <p><strong>اسم العميل:</strong> {selectedOrder.customerName}</p>
            <p><strong>البريد الإلكتروني:</strong> {selectedOrder.customerEmail}</p>
            <p><strong>الهاتف:</strong> {selectedOrder.customerPhone}</p>
            <p><strong>العنوان:</strong> {selectedOrder.shippingAddress}</p>
            <p><strong>تاريخ الطلب:</strong> {new Date(selectedOrder.date).toLocaleString("ar-EG")}</p>
            <p><strong>الحالة:</strong> {statusOptions.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}</p>
            <p><strong>إجمالي السعر:</strong> {selectedOrder.total.toLocaleString("ar-EG")} ج.م</p>
            <h4 className="mt-4 font-semibold">المنتجات:</h4>
            <ul className="list-disc list-inside max-h-48 overflow-y-auto">
              {selectedOrder.items?.map((item, idx) => (
                <li key={idx}>
                  {item.name} - الكمية: {item.quantity} - السعر: {item.price.toLocaleString("ar-EG")} ج.م
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                إغلاق
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderManagement;
