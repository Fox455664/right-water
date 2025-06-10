import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
// تأكد من أن مسار firebase صحيح
import { db, collection, onSnapshot, query as firestoreQuery, orderBy, doc, updateDoc, deleteDoc, writeBatch, where } from '@/firebase'; 
import { Loader2, PackageSearch, Search, MoreHorizontal, Eye, Trash2, Printer, UploadCloud, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const ITEMS_PER_PAGE = 10;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const printRef = useRef(null);
  const { user } = useAuth();

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-500 dark:bg-yellow-400' },
    { value: 'processing', label: 'قيد المعالجة', color: 'bg-blue-500 dark:bg-blue-400' },
    { value: 'shipped', label: 'تم الشحن', color: 'bg-sky-500 dark:bg-sky-400' },
    { value: 'delivered', label: 'تم التسليم', color: 'bg-green-500 dark:bg-green-400' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-red-500 dark:bg-red-400' },
  ];

  const getStatusInfo = (statusValue) => {
    return statusOptions.find(s => s.value === statusValue) || { label: statusValue, color: 'bg-slate-500' };
  };

  // =================================================================
  // !! هنا تم تطبيق الحل الكامل (طبقة الترجمة) !!
  // =================================================================
  useEffect(() => {
    setLoading(true);
    let q = firestoreQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    if (statusFilter !== 'all') {
      q = firestoreQuery(q, where('status', '==', statusFilter));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data(); // البيانات الخام من Firebase

        // ** عملية الترجمة والتنظيف **
        // نقوم ببناء كائن جديد بالشكل الذي يتوقعه باقي الكود
        return {
          id: doc.id,
          // ابحث في كل الاحتمالات الممكنة لهيكل البيانات
          fullName: data.shipping?.fullName || data.customerInfo?.name || "عميل غير مسجل",
          userEmail: data.userEmail || data.shipping?.email || data.customerInfo?.email || 'غير متوفر',
          phone: data.shipping?.phone || data.customerInfo?.phone || 'لا يوجد هاتف',
          address: data.shipping?.address || data.customerInfo?.address || 'لا يوجد عنوان',
          city: data.shipping?.city || data.customerInfo?.city || '',
          country: data.shipping?.country || data.customerInfo?.country || '',

          // ترجمة الحقول المالية وتوفير قيمة افتراضية
          total: data.total || data.totalAmount || 0,
          subtotal: data.subtotal || 0, // افترض أن subtotal موجود أو 0
          shippingCost: data.shipping?.shippingCost || data.shippingCost || 0,
          
          // الحقول الأساسية
          status: data.status || 'pending',
          createdAt: data.createdAt, // نتركه كما هو لأن دالة formatDate تعالجه
          items: data.items || [],
          paymentMethod: data.paymentMethod || 'غير محدد',
        };
      });
      
      setOrders(ordersData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching orders: ", err);
      setError("فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      setLoading(false);
      toast({ title: "خطأ", description: "فشل في تحميل الطلبات.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [statusFilter]); // أزلت toast من هنا لأنه ليس له تأثير مباشر على الاستعلام

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowercasedTerm = searchTerm.toLowerCase();
    return orders.filter(order =>
      (order.id.toLowerCase().includes(lowercasedTerm)) ||
      (order.fullName.toLowerCase().includes(lowercasedTerm)) ||
      (order.userEmail.toLowerCase().includes(lowercasedTerm)) ||
      (order.phone.includes(lowercasedTerm))
    );
  }, [orders, searchTerm]);
  
  // باقي الكود يبقى كما هو لأنه الآن يستقبل البيانات بالصيغة الصحيحة
  
  // ... (لصق باقي الكود الذي أرسلته من هنا)
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      toast({ title: "تم التحديث", description: `تم تحديث حالة الطلب #${orderId.slice(0, 5)}... إلى ${getStatusInfo(newStatus).label}.` });
    } catch (err) {
      console.error("Error updating order status: ", err);
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب.", variant: "destructive" });
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0 || newStatus === 'all') {
      toast({ title: "تنبيه", description: "يرجى تحديد طلب واحد على الأقل وحالة صالحة للتحديث.", variant: "default" });
      return;
    }
    const batch = writeBatch(db);
    selectedOrders.forEach(orderId => {
      const orderRef = doc(db, 'orders', orderId);
      batch.update(orderRef, { status: newStatus, updatedAt: new Date() });
    });
    try {
      await batch.commit();
      toast({ title: "تم التحديث الجماعي", description: `تم تحديث حالة ${selectedOrders.length} طلبات إلى ${getStatusInfo(newStatus).label}.` });
      setSelectedOrders([]);
    } catch (err) {
      console.error("Error bulk updating statuses: ", err);
      toast({ title: "خطأ", description: "فشل التحديث الجماعي للحالات.", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast({ title: "تم الحذف", description: `تم حذف الطلب #${orderId.slice(0, 5)}... بنجاح.` });
    } catch (err) {
      console.error("Error deleting order: ", err);
      toast({ title: "خطأ", description: "فشل حذف الطلب.", variant: "destructive" });
    }
  };

  const handleSelectOrder = (orderId, checked) => {
    setSelectedOrders(prev =>
      checked ? [...prev, orderId] : prev.filter(id => id !== orderId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedOrders(checked ? paginatedOrders.map(o => o.id) : []);
  };

  const openDetailsModal = (order) => {
    setCurrentOrderDetails(order); // الآن `order` بالفعل نظيف وجاهز للعرض
    setIsDetailsModalOpen(true);
  };
  
    const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast({ title: "ملف غير صالح", description: "يرجى اختيار ملف صورة.", variant: "destructive" });
    }
  };

  const handlePrintInvoice = useCallback(() => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
      toast({ title: "خطأ", description: "يرجى السماح بالنوافذ المنبثقة للطباعة.", variant: "destructive" });
      return;
    }
    
    printWindow.document.write('<html><head><title>فاتورة</title>');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
    printWindow.document.write('<style>body { direction: rtl; font-family: "Cairo", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price || 0);
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
        // إذا كان التاريخ بالفعل كائن Date (مثل updatedAt)
        if(timestamp instanceof Date) {
            return timestamp.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        return '-';
    }
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedOrders([]);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-16 w-16 text-sky-500 animate-spin" /></div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 flex items-center">
          <ListFilter className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />
          إدارة الطلبات
        </h1>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="relative">
            <Input
              type="text"
              placeholder="ابحث بالرقم، الاسم، الإيميل، الهاتف..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500 pl-10"
            />
            <Search className="absolute left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">فلترة بالحالة</label>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full dark:bg-slate-700 dark:text-slate-200">
                <SelectValue placeholder="اختر حالة..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {selectedOrders.length > 0 && (
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center mt-2 md:mt-0">
              <Select onValueChange={(value) => handleBulkStatusUpdate(value)}>
                <SelectTrigger className="w-full dark:bg-slate-700 dark:text-slate-200">
                  <SelectValue placeholder="تحديث حالة المحدد..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(s => s.value !== 'all').map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSelectedOrders([])} className="w-full">
                إلغاء تحديد ({selectedOrders.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {paginatedOrders.length === 0 && !loading ? (
        <div className="text-center py-12">
          <PackageSearch className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">لم يتم العثور على طلبات.</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
                <TableRow>
                  <TableHead className="px-3 py-3.5 w-10 text-center">
                    <Checkbox
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked)}
                      aria-label="تحديد الكل"
                    />
                  </TableHead>
                  <TableHead className="text-right px-3 py-3.5">رقم الطلب</TableHead>
                  <TableHead className="text-right px-3 py-3.5">العميل</TableHead>
                  <TableHead className="text-right px-3 py-3.5">التاريخ</TableHead>
                  <TableHead className="text-right px-3 py-3.5">الإجمالي</TableHead>
                  <TableHead className="text-right px-3 py-3.5">الحالة</TableHead>
                  <TableHead className="text-center px-3 py-3.5">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <TableRow key={order.id} data-state={selectedOrders.includes(order.id) ? "selected" : ""} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <TableCell className="px-3 py-4 text-center">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked)}
                          aria-label={`تحديد الطلب ${order.id.slice(0, 8)}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sky-600 dark:text-sky-400 px-3 py-4">
                        <span onClick={() => openDetailsModal(order)} className="hover:underline cursor-pointer">
                          #{order.id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-4">
                        <div>{order.fullName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{order.userEmail}</div>
                      </TableCell>
                      <TableCell className="px-3 py-4">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="px-3 py-4">{formatPrice(order.total)}</TableCell>
                      <TableCell className="px-3 py-4">
                        <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                          <SelectTrigger className={`w-full text-xs h-8 px-2 py-1 rounded-md border-0 focus:ring-0 focus:ring-offset-0 ${statusInfo.color} text-white`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.filter(s => s.value !== 'all').map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center px-3 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailsModal(order)}>
                              <Eye className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> عرض التفاصيل
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 dark:focus:text-red-400">
                                  <Trash2 className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> حذف الطلب
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد أنك تريد حذف الطلب رقم #{order.id.slice(0,8)}...؟ هذا الإجراء لا يمكن التراجع عنه.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                صفحة {currentPage} من {totalPages} (إجمالي {filteredOrders.length} طلبات)
              </span>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Button variant="outline" size="icon" onClick={() => changePage(1)} disabled={currentPage === 1}><ChevronsRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}><ChevronsLeft className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-slate-800 p-0" dir="rtl">
          <div ref={printRef}>
            <DialogHeader className="p-6 border-b dark:border-slate-700">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  تفاصيل الطلب #{currentOrderDetails?.id.slice(0, 8)}
                </DialogTitle>
                {logoPreview && <img src={logoPreview} alt="شعار المتجر" className="h-12 max-w-[150px] object-contain" />}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">تاريخ الطلب: {formatDate(currentOrderDetails?.createdAt)}</p>
              <Badge className={`${getStatusInfo(currentOrderDetails?.status).color} text-white text-xs`}>
                {getStatusInfo(currentOrderDetails?.status).label}
              </Badge>
            </DialogHeader>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">معلومات العميل</h3>
                  <p><strong>الاسم:</strong> {currentOrderDetails?.fullName}</p>
                  <p><strong>البريد:</strong> {currentOrderDetails?.userEmail}</p>
                  <p><strong>الهاتف:</strong> {currentOrderDetails?.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">عنوان الشحن</h3>
                  <p>{currentOrderDetails?.address}</p>
                  <p>{currentOrderDetails?.city}{currentOrderDetails?.country && `, ${currentOrderDetails?.country}`}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-slate-700 dark:text-slate-200">المنتجات المطلوبة</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrderDetails?.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>
                          <div className="flex items-center">
                            <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} className="w-10 h-10 object-cover rounded-md ml-3 rtl:mr-3" />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right border-t dark:border-slate-700 pt-4 mt-4">
                <p><strong>المجموع الفرعي:</strong> {formatPrice(currentOrderDetails?.subtotal)}</p>
                <p><strong>تكلفة الشحن:</strong> {formatPrice(currentOrderDetails?.shippingCost)}</p>
                <p className="text-xl font-bold"><strong>الإجمالي الكلي:</strong> {formatPrice(currentOrderDetails?.total)}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t dark:border-slate-700 flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 no-print">
              <label htmlFor="logoUpload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span><UploadCloud className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> تحميل شعار</span>
                </Button>
                <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <Button onClick={handlePrintInvoice} className="bg-green-500 hover:bg-green-600 text-white">
                <Printer className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> طباعة الفاتورة
              </Button>
            </div>
            <DialogClose asChild className="no-print">
              <Button variant="outline">إغلاق</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default OrderManagement;
