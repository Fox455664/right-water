import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Loader2,
  Truck,
  PackageCheck,
  PackageX,
  Clock,
} from "lucide-react";

const statusOptions = [
  { value: "pending", label: "قيد الانتظار", icon: <Loader2 className="h-4 w-4 text-yellow-500" /> },
  { value: "processing", label: "قيد المعالجة", icon: <Truck className="h-4 w-4 text-blue-500" /> },
  { value: "shipped", label: "تم الشحن", icon: <Truck className="h-4 w-4 text-sky-500" /> },
  { value: "delayed", label: "مؤجل", icon: <Clock className="h-4 w-4 text-purple-600" /> },  // حالة جديدة
  { value: "delivered", label: "تم التسليم", icon: <PackageCheck className="h-4 w-4 text-green-500" /> },
  { value: "cancelled", label: "ملغي", icon: <PackageX className="h-4 w-4 text-red-500" /> },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "shipped":
      return "bg-sky-100 text-sky-700 border-sky-300";
    case "delayed":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export default function OrdersManagement({ ordersData }) {
  // ordersData: array of orders objects passed as prop or fetched from API
  const [orders, setOrders] = useState(ordersData || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // For Modals
  const [viewOrder, setViewOrder] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteOrder, setDeleteOrder] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Handlers
  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleViewOpen = (order) => {
    setViewOrder(order);
    setIsViewOpen(true);
  };
  const handleViewClose = () => {
    setIsViewOpen(false);
    setViewOrder(null);
  };

  const handleDeleteOpen = (order) => {
    setDeleteOrder(order);
    setIsDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeleteOrder(null);
  };
  const handleDeleteConfirm = () => {
    if (!deleteOrder) return;
    setOrders((prev) => prev.filter((order) => order.id !== deleteOrder.id));
    handleDeleteClose();
  };

  // Filter & Search & Pagination logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Pagination controls
  const gotoPage = (p) => {
    if (p < 1) p = 1;
    else if (p > totalPages) p = totalPages;
    setPage(p);
  };

  return (
    <div className="p-4 text-right max-w-full overflow-x-auto">
      <h2 className="text-2xl mb-4 font-semibold text-primary">إدارة الطلبات</h2>

      {/* بحث و فلترة */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
        <input
          type="search"
          placeholder="ابحث باسم العميل..."
          className="input input-bordered w-full sm:w-64"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={filterStatus}
          onValueChange={(val) => {
            setFilterStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلتر حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            {statusOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* جدول الطلبات */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-gray-300">رقم الطلب</th>
            <th className="p-2 border border-gray-300">اسم العميل</th>
            <th className="p-2 border border-gray-300">تاريخ الطلب</th>
            <th className="p-2 border border-gray-300">الإجمالي</th>
            <th className="p-2 border border-gray-300">الحالة</th>
            <th className="p-2 border border-gray-300 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-2 border border-gray-300 font-mono truncate max-w-[110px]">
                  {order.id}
                </td>
                <td className="p-2 border border-gray-300">
                  {order.customerInfo?.name || "-"}
                </td>
                <td className="p-2 border border-gray-300">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("ar-EG")
                    : "-"}
                </td>
                <td className="p-2 border border-gray-300">
                  {(order.totalAmount || 0).toLocaleString("ar-EG", {
                    style: "currency",
                    currency: "EGP",
                  })}
                </td>
                <td className="p-2 border border-gray-300">
                  <Select
                    value={order.status}
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                  >
                    <SelectTrigger
                      className={`w-[150px] text-xs h-9 ${getStatusStyles(
                        order.status
                      )}`}
                    >
                      <div className="flex items-center">
                        {
                          statusOptions.find((s) => s.value === order.status)
                            ?.icon
                        }
                        <span className="mr-2">
                          <SelectValue />
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(({ value, label, icon }) => (
                        <SelectItem key={value} value={value} className="text-xs">
                          <div className="flex items-center">
                            {icon}
                            <span className="mr-2">{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 border border-gray-300 text-center">
                  <div className="flex justify-center items-center space-x-1 space-x-reverse">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleViewOpen(order)}
                      aria-label="عرض الطلب"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteOpen(order)}
                      aria-label="حذف الطلب"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="p-4 text-center text-muted-foreground"
              >
                لا توجد طلبات للعرض
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-4 space-x-reverse">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => gotoPage(page - 1)}
        >
          السابق
        </Button>
        <span>
          الصفحة {page} من {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => gotoPage(page + 1)}
        >
          التالي
        </Button>
      </div>

      {/* تفاصيل الطلب - مودال */}
      <Dialog open={isViewOpen} onOpenChange={handleViewClose}>
        <DialogContent className="max-w-lg text-right sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl text-primary">
              تفاصيل الطلب:{" "}
              <span className="font-mono text-sm">{viewOrder?.id}</span>
            </DialogTitle>
            <DialogDescription>
              <span
                className={`inline-block px-2 py-1 rounded-md text-xs ${getStatusStyles(
                  viewOrder?.status
                )}`}
              >
                {statusOptions.find((s) => s.value === viewOrder?.status)?.label ||
                  viewOrder?.status}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="glassmorphism-card p-4 rounded border border-gray-300 bg-white shadow-sm">
              <h3 className="text-lg text-primary flex items-center mb-2">
                <Eye className="ml-2" />
                معلومات العميل
              </h3>
              <p>
                <strong>الاسم:</strong> {viewOrder?.customerInfo?.name || "-"}
              </p>
              <p>
                <strong>البريد:</strong> {viewOrder?.customerInfo?.email || "-"}
              </p>
              <p>
                <strong>الهاتف:</strong> {viewOrder?.customerInfo?.phone || "-"}
              </p>
              <p>
                <strong>العنوان:</strong>{" "}
                {viewOrder?.customerInfo
                  ? `${viewOrder.customerInfo.address || ""}, ${viewOrder.customerInfo.city || ""
                    }, ${viewOrder.customerInfo.country || ""}`
                  : "-"}
              </p>
            </div>
            <div className="glassmorphism-card p-4 rounded border border-gray-300 bg-white shadow-sm">
              <h3 className="text-lg text-primary flex items-center mb-2">
                <Truck className="ml-2" />
                تفاصيل الطلب
              </h3>
              <p>
                <strong>تاريخ الطلب:</strong>{" "}
                {viewOrder?.createdAt
                  ? new Date(viewOrder.createdAt).toLocaleString("ar-EG", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })
                  : "-"}
              </p>
              <p>
                <strong>طريقة الدفع:</strong>{" "}
                {viewOrder?.paymentMethod === "cod"
                  ? "الدفع عند الاستلام"
                  : viewOrder?.paymentMethod || "-"}
              </p>
              <p>
                <strong>الإجمالي الكلي:</strong>{" "}
                <span className="font-bold text-green-600">
                  {(viewOrder?.totalAmount || 0).toLocaleString("ar-EG", {
                    style: "currency",
                    currency: "EGP",
                  })}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 text-primary flex items-center">
              <PackageCheck className="ml-2" />
              المنتجات المطلوبة:
            </h4>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 bg-muted/20">
              {viewOrder?.items && viewOrder.items.length > 0 ? (
                <ul className="space-y-2">
                  {viewOrder.items.map((item, index) => (
                    <li
                      key={index}
                      className="p-2 border-b last:border-b-0 flex justify-between items-center text-sm bg-background/50 rounded"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          الكمية: {item.quantity} | السعر:{" "}
                          {(item.price || 0).toLocaleString("ar-EG", {
                            style: "currency",
                            currency: "EGP",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {((item.price || 0) * item.quantity).toLocaleString(
                          "ar-EG",
                          { style: "currency", currency: "EGP" }
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center p-4">
                  لا توجد منتجات في هذا الطلب.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleViewClose}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف */}
      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteClose}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الطلب رقم (
              {deleteOrder?.id}) بشكل دائم من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse space-x-2 space-x-reverse">
            <AlertDialogAction onClick={handleDeleteConfirm}>
              حذف
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleDeleteClose}>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
