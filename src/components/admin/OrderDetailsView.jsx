"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  db,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "@/firebase";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Eye,
  PackageCheck,
  PackageX,
  Truck,
  Loader2,
  AlertTriangle,
  UserCircle,
  CalendarDays,
  ListOrdered as ListOrderedIcon,
  Trash2,
  Clock, // أيقونة ساعة مناسبة للتأجيل
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

// debounce helper function
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const statusOptions = [
  {
    value: "pending",
    label: "قيد الانتظار",
    icon: <Loader2 className="h-4 w-4 text-yellow-500" />,
  },
  {
    value: "processing",
    label: "قيد المعالجة",
    icon: <Truck className="h-4 w-4 text-blue-500" />,
  },
  {
    value: "shipped",
    label: "تم الشحن",
    icon: <Truck className="h-4 w-4 text-sky-500" />,
  },
  {
    value: "delayed", // الحالة الجديدة
    label: "تأجيل",
    icon: <Clock className="h-4 w-4 text-orange-500" />,
  },
  {
    value: "delivered",
    label: "تم التسليم",
    icon: <PackageCheck className="h-4 w-4 text-green-500" />,
  },
  {
    value: "cancelled",
    label: "ملغي",
    icon: <PackageX className="h-4 w-4 text-red-500" />,
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "shipped":
      return "bg-sky-100 text-sky-700 border-sky-300";
    case "delayed": // ستايل جديد لحالة التأجيل
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const OrderDetailsView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        });
        setOrders(fetchedOrders);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching orders: ", err);
        setError("حدث خطأ أثناء تحميل الطلبات من قاعدة البيانات.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // debounce تحديث البحث
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearch(value.trim().toLowerCase());
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (order?.status === newStatus) return; // لا يحدث إذا نفس الحالة

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: "✅ تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${
          statusOptions.find((s) => s.value === newStatus)?.label || newStatus
        }.`,
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      toast({ title: "❌ خطأ في تحديث الحالة", description: err.message, variant: "destructive" });
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteAlertOpen(true);
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(db, "orders", orderToDelete.id));
      toast({
        title: "🗑️ تم حذف الطلب",
        description: `تم حذف الطلب رقم ${orderToDelete.id} بنجاح.`,
        className: "bg-red-600 text-white",
      });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
      setIsViewModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      toast({ title: "❌ خطأ في حذف الطلب", description: err.message, variant: "destructive" });
      setOrderToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  // تصفية الطلبات حسب البحث مع debounce
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;

    return orders.filter((order) => {
      const idMatch = order.id.toLowerCase().includes(debouncedSearch);
      const nameMatch = order.customerInfo?.name
        ?.toLowerCase()
        .includes(debouncedSearch);
      return idMatch || nameMatch;
    });
  }, [debouncedSearch, orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10" aria-live="polite">
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
      <h2 className="text-2xl font-semibold text-primary flex items-center">
        <ListOrderedIcon className="ml-2 h-6 w-6" />
        عرض وإدارة الطلبات
      </h2>

      {/* حقل البحث */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ابحث برقم الطلب أو اسم العميل..."
          className="w-full md:w-96 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={handleSearchChange}
          dir="rtl"
          aria-label="بحث عن الطلبات"
          autoComplete="off"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          لا توجد طلبات تطابق البحث.
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
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-right">{order.id}</TableCell>
                  <TableCell className="text-right">{order.customerInfo?.name || "غير معروف"}</TableCell>
                  <TableCell className="text-right">
                    {order.createdAt.toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-right">{order.totalPrice?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue>
                          {
                            statusOptions.find((s) => s.value === order.status)
                              ?.label || order.status
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(({ value, label, icon }) => (
                          <SelectItem key={value} value={value} className="flex items-center space-x-2 rtl:space-x-reverse">
                            {icon}
                            <span>{label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center space-x-1 rtl:space-x-reverse">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)} title="عرض الطلب">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDeleteOrder(order)}
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* عرض تفاصيل الطلب - مودال */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent dir="rtl" className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              {selectedOrder ? (
                <div className="space-y-4">
                  <p>
                    <strong>رقم الطلب:</strong> {selectedOrder.id}
                  </p>
                  <p>
                    <strong>اسم العميل:</strong> {selectedOrder.customerInfo?.name}
                  </p>
                  <p>
                    <strong>الهاتف:</strong> {selectedOrder.customerInfo?.phone}
                  </p>
                  <p>
                    <strong>العنوان:</strong> {selectedOrder.customerInfo?.address}
                  </p>
                  <p>
                    <strong>تاريخ الطلب:</strong>{" "}
                    {selectedOrder.createdAt.toLocaleString("ar-EG")}
                  </p>
                  <p>
                    <strong>حالة الطلب:</strong>{" "}
                    {
                      statusOptions.find(
                        (s) => s.value === selectedOrder.status
                      )?.label
                    }
                  </p>
                  <p>
                    <strong>المنتجات:</strong>
                  </p>
                  <ul className="list-disc list-inside max-h-64 overflow-auto border p-2 rounded">
                    {selectedOrder.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.name} - الكمية: {item.quantity} - السعر: {item.price} ج.م
                      </li>
                    ))}
                  </ul>
                  <p className="text-lg font-semibold">
                    الإجمالي: {selectedOrder.totalPrice?.toFixed(2)} ج.م
                  </p>
                </div>
              ) : (
                <p>لا توجد تفاصيل لعرضها.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأكيد حذف الطلب */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              حذف الطلب سيؤدي إلى إزالة جميع بياناته بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteOrder} className="bg-red-600 hover:bg-red-700">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default OrderDetailsView;
