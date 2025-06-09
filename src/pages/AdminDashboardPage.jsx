import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { useToast } from "@/components/ui/use-toast";
    import { Package, ListOrdered, PlusCircle, Trash2, Edit3, Eye, UploadCloud, XCircle, MoreHorizontal, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
    import { db, storage, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy as firestoreOrderBy, query, where, Timestamp, ref, uploadBytes, getDownloadURL, onSnapshot, writeBatch } from '@/firebase';

    const ITEMS_PER_PAGE = 7;

    const AdminProductsTab = () => {
      const [products, setProducts] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingProduct, setEditingProduct] = useState(null);
      const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '', description: '', imageUrl: '' });
      const [imageFile, setImageFile] = useState(null);
      const [isUploading, setIsUploading] = useState(false);
      const { toast } = useToast();

      const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
          const productsCollection = collection(db, 'products');
          const q = query(productsCollection, firestoreOrderBy("name"));
          const productsSnapshot = await getDocs(q);
          const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(productsList);
        } catch (error) {
          console.error("Error fetching products:", error);
          toast({ title: "خطأ", description: "لم نتمكن من تحميل المنتجات.", variant: "destructive" });
        }
        setIsLoading(false);
      }, [toast]);

      useEffect(() => {
        fetchProducts();
      }, [fetchProducts]);

      const handleImageChange = (e) => {
        if (e.target.files[0]) {
          setImageFile(e.target.files[0]);
          setNewProduct({ ...newProduct, imageUrl: URL.createObjectURL(e.target.files[0]) });
        }
      };

      const handleUploadImage = async () => {
        if (!imageFile) return null;
        setIsUploading(true);
        try {
          const imageName = `${Date.now()}_${imageFile.name}`;
          const storageRef = ref(storage, `products/${imageName}`);
          await uploadBytes(storageRef, imageFile);
          const downloadURL = await getDownloadURL(storageRef);
          setIsUploading(false);
          return downloadURL;
        } catch (error) {
          console.error("Error uploading image: ", error);
          toast({ title: "خطأ في رفع الصورة", description: error.message, variant: "destructive" });
          setIsUploading(false);
          return null;
        }
      };
      
      const handleSaveProduct = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category || !newProduct.description) {
          toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة.", variant: "destructive" });
          return;
        }

        let imageUrlToSave = newProduct.imageUrl;
        if (imageFile && newProduct.imageUrl && newProduct.imageUrl.startsWith('blob:')) {
          imageUrlToSave = await handleUploadImage();
          if (!imageUrlToSave) return; 
        }

        const productData = {
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          imageUrl: imageUrlToSave,
        };

        try {
          if (editingProduct) {
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, productData);
            toast({ title: "نجاح", description: "تم تحديث المنتج بنجاح." , className: "bg-green-500 text-white" });
          } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: "نجاح", description: "تمت إضافة المنتج بنجاح.", className: "bg-green-500 text-white" });
          }
          closeModal();
          fetchProducts();
        } catch (error) {
          console.error("Error saving product: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من حفظ المنتج.", variant: "destructive" });
        }
      };

      const handleDeleteProduct = async (productId) => {
        if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) return;
        try {
          await deleteDoc(doc(db, 'products', productId));
          toast({ title: "نجاح", description: "تم حذف المنتج.", className: "bg-green-500 text-white" });
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من حذف المنتج.", variant: "destructive" });
        }
      };

      const openModal = (product = null) => {
        setEditingProduct(product);
        setNewProduct(product ? { ...product, price: product.price.toString(), stock: product.stock.toString() } : { name: '', price: '', stock: '', category: '', description: '', imageUrl: '' });
        setImageFile(null);
        setIsModalOpen(true);
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', stock: '', category: '', description: '', imageUrl: '' });
        setImageFile(null);
      };


      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-pink-400">إدارة المنتجات</h2>
            <Button onClick={() => openModal()} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
              <PlusCircle size={20} className="mr-2" /> إضافة منتج جديد
            </Button>
          </div>
          {isLoading ? <p className="text-center py-4">جاري تحميل المنتجات...</p> : products.length === 0 ? <p className="text-center py-4 text-gray-400">لا توجد منتجات لعرضها. قم بإضافة منتج جديد!</p> : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-700/50">
                  <TableHead className="px-6 py-3 text-gray-400">صورة</TableHead>
                  <TableHead className="px-6 py-3 text-gray-400">اسم المنتج</TableHead>
                  <TableHead className="px-6 py-3 text-gray-400">السعر</TableHead>
                  <TableHead className="px-6 py-3 text-gray-400">المخزون</TableHead>
                  <TableHead className="px-6 py-3 text-gray-400">الفئة</TableHead>
                  <TableHead className="px-6 py-3 text-center text-gray-400">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <img-replace src={product.imageUrl || "https://via.placeholder.com/50"} alt={product.name} className="w-12 h-12 object-cover rounded-md"/>
                      Product image for ${product.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-white whitespace-nowrap">{product.name}</TableCell>
                    <TableCell className="px-6 py-4 text-green-400">${(product.price || 0).toFixed(2)}</TableCell>
                    <TableCell className="px-6 py-4">{product.stock}</TableCell>
                    <TableCell className="px-6 py-4">{product.category}</TableCell>
                    <TableCell className="px-6 py-4 text-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-1" onClick={() => openModal(product)}><Edit3 size={18}/></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 p-1" onClick={() => handleDeleteProduct(product.id)}><Trash2 size={18}/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}

          <AnimatePresence>
            {isModalOpen && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-1 text-pink-400">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">اسم المنتج</label>
                      <Input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 rounded-md bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">السعر</label>
                        <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 rounded-md bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">المخزون</label>
                        <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-2 rounded-md bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الفئة</label>
                      <Input type="text" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 rounded-md bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
                      <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows="3" className="w-full p-2 rounded-md bg-gray-700 border-gray-600 focus:ring-pink-500 focus:border-pink-500 text-white"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">صورة المنتج</label>
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {newProduct.imageUrl ? (
                            <div className="relative group">
                              <img-replace src={newProduct.imageUrl} alt="Preview" className="mx-auto h-32 w-auto rounded-md object-contain" />
                              Image preview for product ${newProduct.name}
                              <button 
                                onClick={() => { setNewProduct({...newProduct, imageUrl: ''}); setImageFile(null); }}
                                className="absolute top-0 right-0 m-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                          )}
                          <div className="flex text-sm text-gray-500 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-pink-400 hover:text-pink-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-pink-500 px-2 py-1"
                            >
                              <span>ارفع ملفًا</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                            </label>
                            <p className="pl-1">أو اسحب وأفلت</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={closeModal} className="text-gray-300 hover:bg-gray-700">إلغاء</Button>
                    <Button onClick={handleSaveProduct} disabled={isUploading} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50">
                      {isUploading ? 'جاري الرفع...' : editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </motion.div>
      );
    };

    const AdminOrdersTab = () => {
      const [orders, setOrders] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('الكل');
      const [selectedOrders, setSelectedOrders] = useState(new Set());
      const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
      const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
      const [currentPage, setCurrentPage] = useState(1);
      const { toast } = useToast();
    
      useEffect(() => {
        setLoading(true);
        let q = collection(db, 'orders');
        if (statusFilter !== 'الكل') {
          q = query(q, where("status", "==", statusFilter));
        }
        q = query(q, firestoreOrderBy("createdAt", "desc"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const ordersList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
              customerInfo: data.customerInfo || { name: data.userEmail || 'غير متوفر', email: data.userEmail || 'غير متوفر' },
              shippingAddress: data.shippingAddress || { line1: 'غير متوفر', city: '', postalCode: ''},
              items: data.items || [],
              totalAmount: data.totalAmount || 0,
            };
          });
          setOrders(ordersList);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching orders: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من تحميل الطلبات.", variant: "destructive" });
          setLoading(false);
        });
    
        return () => unsubscribe();
      }, [statusFilter, toast]);
    
      const filteredOrders = useMemo(() => {
        return orders.filter(order => {
          const searchTermLower = searchTerm.toLowerCase();
          const matchesSearch = (
            order.id.toLowerCase().includes(searchTermLower) ||
            (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(searchTermLower)) ||
            (order.customerInfo?.email && order.customerInfo.email.toLowerCase().includes(searchTermLower)) ||
            (order.shippingAddress?.city && order.shippingAddress.city.toLowerCase().includes(searchTermLower))
          );
          return matchesSearch;
        });
      }, [orders, searchTerm]);
    
      const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      }, [filteredOrders, currentPage]);
    
      const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    
      const handleStatusChange = async (orderId, newStatus) => {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, { status: newStatus });
          toast({ title: "نجاح", description: `تم تحديث حالة الطلب #${orderId.slice(0,6)} إلى ${newStatus}.`, className: "bg-green-500 text-white" });
        } catch (error) {
          console.error("Error updating order status: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من تحديث حالة الطلب.", variant: "destructive" });
        }
      };

      const handleBulkStatusChange = async (newStatus) => {
        if (selectedOrders.size === 0) {
          toast({ title: "تنبيه", description: "يرجى تحديد طلب واحد على الأقل.", variant: "default" });
          return;
        }
        const batch = writeBatch(db);
        selectedOrders.forEach(orderId => {
          const orderRef = doc(db, 'orders', orderId);
          batch.update(orderRef, { status: newStatus });
        });
        try {
          await batch.commit();
          toast({ title: "نجاح", description: `تم تحديث حالة ${selectedOrders.size} طلبات إلى ${newStatus}.`, className: "bg-green-500 text-white" });
          setSelectedOrders(new Set());
        } catch (error) {
          console.error("Error bulk updating order status: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من تحديث حالة الطلبات المحددة.", variant: "destructive" });
        }
      };
    
      const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(`هل أنت متأكد أنك تريد حذف الطلب #${orderId.slice(0,6)}؟`)) return;
        try {
          await deleteDoc(doc(db, 'orders', orderId));
          toast({ title: "نجاح", description: `تم حذف الطلب #${orderId.slice(0,6)}.`, className: "bg-red-500 text-white" });
          setSelectedOrders(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
          });
        } catch (error) {
          console.error("Error deleting order: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من حذف الطلب.", variant: "destructive" });
        }
      };

      const handleBulkDelete = async () => {
        if (selectedOrders.size === 0) {
          toast({ title: "تنبيه", description: "يرجى تحديد طلب واحد على الأقل للحذف.", variant: "default" });
          return;
        }
        if (!window.confirm(`هل أنت متأكد أنك تريد حذف ${selectedOrders.size} طلبات؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
        
        const batch = writeBatch(db);
        selectedOrders.forEach(orderId => {
          const orderRef = doc(db, 'orders', orderId);
          batch.delete(orderRef);
        });
        try {
          await batch.commit();
          toast({ title: "نجاح", description: `تم حذف ${selectedOrders.size} طلبات بنجاح.`, className: "bg-red-500 text-white" });
          setSelectedOrders(new Set());
        } catch (error) {
          console.error("Error bulk deleting orders: ", error);
          toast({ title: "خطأ", description: "لم نتمكن من حذف الطلبات المحددة.", variant: "destructive" });
        }
      };
    
      const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev => {
          const newSet = new Set(prev);
          if (newSet.has(orderId)) {
            newSet.delete(orderId);
          } else {
            newSet.add(orderId);
          }
          return newSet;
        });
      };
    
      const handleSelectAll = (isChecked) => {
        if (isChecked) {
          setSelectedOrders(new Set(paginatedOrders.map(order => order.id)));
        } else {
          setSelectedOrders(new Set());
        }
      };
    
      const openDetailsModal = (order) => {
        setCurrentOrderDetails(order);
        setIsDetailsModalOpen(true);
      };

      const handlePrintInvoice = (order) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>فاتورة طلب</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; direction: rtl; margin: 20px;} table{width: 100%; border-collapse: collapse;} th,td{border: 1px solid #ddd; padding: 8px; text-align: right;} .header{text-align: center; margin-bottom: 20px;} .items-table th{background-color: #f2f2f2;} .total{font-weight: bold;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="header"><h1>فاتورة طلب رقم: #${order.id.slice(0,8)}</h1></div>`);
        printWindow.document.write(`<p><strong>تاريخ الطلب:</strong> ${order.createdAt.toLocaleDateString('ar-EG')} ${order.createdAt.toLocaleTimeString('ar-EG')}</p>`);
        printWindow.document.write(`<p><strong>اسم العميل:</strong> ${order.customerInfo?.name || 'غير متوفر'}</p>`);
        printWindow.document.write(`<p><strong>البريد الإلكتروني:</strong> ${order.customerInfo?.email || 'غير متوفر'}</p>`);
        printWindow.document.write(`<p><strong>عنوان الشحن:</strong> ${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}</p>`);
        printWindow.document.write(`<p><strong>حالة الطلب:</strong> ${order.status}</p>`);
        printWindow.document.write('<h3>المنتجات:</h3><table class="items-table"><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر الفردي</th><th>الإجمالي</th></tr></thead><tbody>');
        order.items.forEach(item => {
          printWindow.document.write(`<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td><td>$${(item.price * item.quantity).toFixed(2)}</td></tr>`);
        });
        printWindow.document.write(`</tbody></table>`);
        printWindow.document.write(`<h3 class="total">الإجمالي الكلي: $${order.totalAmount.toFixed(2)}</h3>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      };
      
      const orderStatuses = ["الكل", "قيد المراجعة", "قيد المعالجة", "تم الشحن", "تم التوصيل", "ملغي"];

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-pink-400">إدارة الطلبات</h2>
            <div className="flex gap-2 flex-wrap">
              {selectedOrders.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500/30">تغيير حالة المحدد ({selectedOrders.size})</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
                      {orderStatuses.filter(s => s !== "الكل").map(status => (
                        <DropdownMenuItem key={status} onSelect={() => handleBulkStatusChange(status)} className="hover:bg-gray-700 focus:bg-gray-700">
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="destructive" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                    <Trash2 size={16} className="mr-2"/> حذف المحدد ({selectedOrders.size})
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <Input 
              type="text" 
              placeholder="ابحث برقم الطلب, اسم العميل, الإيميل, المدينة..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 flex-grow"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-white focus:ring-pink-500 focus:border-pink-500">
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status} className="hover:bg-gray-700 focus:bg-gray-700 data-[state=checked]:bg-pink-500/30">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? <p className="text-center py-4">جاري تحميل الطلبات...</p> : paginatedOrders.length === 0 ? <p className="text-center py-4 text-gray-400">لا توجد طلبات تطابق الفلترة الحالية.</p> : (
            <>
              <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-700/50">
                      <TableHead className="px-4 py-3 w-[50px] text-gray-400">
                        <Checkbox 
                          checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                          onCheckedChange={(checked) => handleSelectAll(checked)}
                          aria-label="Select all orders on this page"
                          className="border-gray-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-600"
                        />
                      </TableHead>
                      <TableHead className="px-6 py-3 text-gray-400">رقم الطلب</TableHead>
                      <TableHead className="px-6 py-3 text-gray-400">العميل</TableHead>
                      <TableHead className="px-6 py-3 text-gray-400">التاريخ</TableHead>
                      <TableHead className="px-6 py-3 text-gray-400">الإجمالي</TableHead>
                      <TableHead className="px-6 py-3 text-gray-400">الحالة</TableHead>
                      <TableHead className="px-6 py-3 text-center text-gray-400">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors data-[state=selected]:bg-gray-700/60" data-state={selectedOrders.has(order.id) ? 'selected' : ''}>
                        <TableCell className="px-4 py-4">
                          <Checkbox 
                            checked={selectedOrders.has(order.id)} 
                            onCheckedChange={() => handleSelectOrder(order.id)}
                            aria-label={`Select order ${order.id}`}
                            className="border-gray-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-600"
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium text-white whitespace-nowrap">#{order.id.slice(0,8)}</TableCell>
                        <TableCell className="px-6 py-4">
                          <div>{order.customerInfo?.name || 'غير متوفر'}</div>
                          <div className="text-xs text-gray-400">{order.customerInfo?.email}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4">{order.createdAt.toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell className="px-6 py-4 text-green-400">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'تم التوصيل' ? 'bg-green-500/30 text-green-300' : 
                            order.status === 'تم الشحن' ? 'bg-blue-500/30 text-blue-300' : 
                            order.status === 'قيد المعالجة' ? 'bg-yellow-500/30 text-yellow-300' :
                            order.status === 'ملغي' ? 'bg-red-500/30 text-red-300' :
                            'bg-gray-500/30 text-gray-300' 
                          }`}>
                            {order.status || 'قيد المراجعة'}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400 p-1 h-8 w-8">
                                <MoreHorizontal size={18}/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700 w-48">
                              <DropdownMenuItem onSelect={() => openDetailsModal(order)} className="hover:bg-gray-700 focus:bg-gray-700">
                                <Eye size={16} className="mr-2 text-sky-400"/> عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700"/>
                              <DropdownMenuItem onSelect={() => handlePrintInvoice(order)} className="hover:bg-gray-700 focus:bg-gray-700">
                                <Printer size={16} className="mr-2 text-purple-400"/> طباعة الفاتورة
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700"/>
                              {orderStatuses.filter(s => s !== "الكل" && s !== order.status).map(status => (
                                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(order.id, status)} className="hover:bg-gray-700 focus:bg-gray-700">
                                  تغيير إلى: {status}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator className="bg-gray-700"/>
                              <DropdownMenuItem onSelect={() => handleDeleteOrder(order.id)} className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-300">
                                <Trash2 size={16} className="mr-2"/> حذف الطلب
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  عرض {paginatedOrders.length} من {filteredOrders.length} طلبات
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className="text-white border-purple-500 hover:bg-purple-500/30"
                  >
                    <ChevronRight size={16} className="ml-1"/> السابق
                  </Button>
                  <span className="text-sm text-gray-300 px-2 py-1 self-center">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className="text-white border-purple-500 hover:bg-purple-500/30"
                  >
                    التالي <ChevronLeft size={16} className="mr-1"/>
                  </Button>
                </div>
              </div>
            </>
          )}

          <AnimatePresence>
            {isDetailsModalOpen && currentOrderDetails && (
              <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold mb-1 text-pink-400">تفاصيل الطلب #{currentOrderDetails.id.slice(0,8)}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      تاريخ الطلب: {currentOrderDetails.createdAt.toLocaleDateString('ar-EG')} {currentOrderDetails.createdAt.toLocaleTimeString('ar-EG')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-2">معلومات العميل:</h4>
                        <p><strong>الاسم:</strong> {currentOrderDetails.customerInfo?.name || 'غير متوفر'}</p>
                        <p><strong>البريد الإلكتروني:</strong> {currentOrderDetails.customerInfo?.email || 'غير متوفر'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-2">عنوان الشحن:</h4>
                        <p>{currentOrderDetails.shippingAddress?.line1}</p>
                        <p>{currentOrderDetails.shippingAddress?.city}, {currentOrderDetails.shippingAddress?.postalCode}</p>
                        <p>{currentOrderDetails.shippingAddress?.country}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">المنتجات المطلوبة:</h4>
                      <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-md p-2 space-y-2">
                        {currentOrderDetails.items.map(item => (
                          <div key={item.id || item.name} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                            <div>
                              <p className="font-medium">{item.name} <span className="text-xs text-gray-400">(x{item.quantity})</span></p>
                              <p className="text-sm text-gray-300">${item.price.toFixed(2)} للقطعة</p>
                            </div>
                            <p className="font-semibold text-green-400">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <p className="flex justify-between"><span>طريقة الدفع:</span> <span className="font-medium">{currentOrderDetails.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : currentOrderDetails.paymentMethod}</span></p>
                      <p className="flex justify-between mt-1"><span>حالة الطلب الحالية:</span> <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                        currentOrderDetails.status === 'تم التوصيل' ? 'bg-green-500/30 text-green-300' : 
                        currentOrderDetails.status === 'تم الشحن' ? 'bg-blue-500/30 text-blue-300' : 
                        currentOrderDetails.status === 'قيد المعالجة' ? 'bg-yellow-500/30 text-yellow-300' :
                        currentOrderDetails.status === 'ملغي' ? 'bg-red-500/30 text-red-300' :
                        'bg-gray-500/30 text-gray-300' 
                      }`}>{currentOrderDetails.status}</span></p>
                      <p className="flex justify-between text-xl font-bold mt-3 text-pink-400">
                        <span>الإجمالي الكلي:</span>
                        <span>${currentOrderDetails.totalAmount.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => handlePrintInvoice(currentOrderDetails)} className="text-purple-300 border-purple-500 hover:bg-purple-500/20">
                      <Printer size={16} className="mr-2"/> طباعة الفاتورة
                    </Button>
                    <DialogClose asChild>
                      <Button variant="ghost" className="text-gray-300 hover:bg-gray-700">إغلاق</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </motion.div>
      );
    };

    const AdminPage = ({ user }) => {
      const [activeTab, setActiveTab] = useState('orders'); 
      
      if (user && user.email !== 'admin@example.com') {
        return (
          <div className="min-h-[calc(100vh-150px)] bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl text-red-500 mb-4">غير مصرح بالدخول</h1>
            <p className="text-gray-400">هذه الصفحة مخصصة للمسؤولين فقط.</p>
          </div>
        );
      }

      return (
        <div className="min-h-[calc(100vh-150px)] bg-gray-900 text-white p-6 selection:bg-pink-500 selection:text-white">
          <div className="container mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500"
            >
              لوحة التحكم الإدارية
            </motion.h1>
            <div className="flex border-b border-gray-700 mb-6">
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`py-3 px-6 font-medium transition-colors ${activeTab === 'orders' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-pink-300'}`}
              >
                <ListOrdered size={18} className="inline mr-2" /> الطلبات
              </button>
              <button 
                onClick={() => setActiveTab('products')} 
                className={`py-3 px-6 font-medium transition-colors ${activeTab === 'products' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-pink-300'}`}
              >
                <Package size={18} className="inline mr-2" /> المنتجات
              </button>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === 'products' && <AdminProductsTab key="products-tab" />}
              {activeTab === 'orders' && <AdminOrdersTab key="orders-tab" />}
            </AnimatePresence>
          </div>
        </div>
      );
    };

    export default AdminPage;
