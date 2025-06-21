// src/components/admin/ProductManagement.jsx (النسخة المعدلة لاستخدام رابط الصورة)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, Package, Loader2, AlertTriangle, Search, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// --- مكون فورم المنتج ---
const ProductForm = ({ productData, setProductData, handleSubmit, isEdit, closeModal, isSubmitting }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, productData, isEdit)} className="grid gap-4 py-4 text-right">
      <div className="space-y-1">
        <Label htmlFor="name">اسم المنتج</Label>
        <Input id="name" name="name" value={productData.name} onChange={handleInputChange} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">الفئة</Label>
        <Input id="category" name="category" value={productData.category} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="price">السعر (ج.م)</Label>
          <Input id="price" name="price" type="number" value={productData.price} onChange={handleInputChange} required min="0" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label>
          <Input id="originalPrice" name="originalPrice" type="number" value={productData.originalPrice} onChange={handleInputChange} min="0" />
        </div>
      </div>
      <div className="space-y-1">
          <Label htmlFor="stock">الكمية المتاحة (المخزون)</Label>
          <Input id="stock" name="stock" type="number" value={productData.stock} onChange={handleInputChange} required min="0" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="image">رابط الصورة</Label>
        <div className="relative">
           <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input id="image" name="image" type="url" placeholder="https://example.com/image.jpg" value={productData.image} onChange={handleInputChange} required className="pl-10"/>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">الوصف</Label>
        <Textarea id="description" name="description" value={productData.description} onChange={handleInputChange} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeModal}>إلغاء</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
          {isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </Button>
      </DialogFooter>
    </form>
  );
};


// --- المكون الرئيسي لإدارة المنتجات ---
const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // State للمودالات
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  // State للمنتج الحالي والجديد
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' });
  
  // State لعمليات التحميل والبحث
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({ amount: 0, type: 'add' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError("حدث خطأ أثناء تحميل المنتجات.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitProduct = async (e, productData, isEdit = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 🔥🔥 التعديل هنا: نأخذ الرابط مباشرة من الفورم 🔥🔥
    const dataToSubmit = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      stock: parseInt(productData.stock, 10) || 0,
      image: productData.image.trim(), // رابط الصورة مباشرة
      updatedAt: serverTimestamp(),
    };

    if (!isEdit) {
      dataToSubmit.createdAt = serverTimestamp();
    }

    if (!dataToSubmit.name || dataToSubmit.price <= 0 || !dataToSubmit.image) {
      toast({ title: "بيانات ناقصة", description: "الرجاء إدخال اسم وسعر ورابط صورة المنتج.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        await updateDoc(doc(db, 'products', productData.id), dataToSubmit);
        toast({ title: "✅ تم تعديل المنتج" });
        setIsEditModalOpen(false);
      } else {
        await addDoc(collection(db, 'products'), dataToSubmit);
        toast({ title: "✅ تم إضافة المنتج" });
        setIsAddModalOpen(false);
        setNewProduct({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' });
      }
    } catch (err) {
      toast({ title: `❌ خطأ في ${isEdit ? 'التعديل' : 'الإضافة'}`, description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "🗑️ تم حذف المنتج بنجاح" });
    } catch (error) {
      toast({ title: "❌ خطأ", description: "فشل حذف المنتج.", variant: "destructive" });
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!currentProduct || !stockUpdate.amount) return;
    setIsSubmitting(true);

    const productRef = doc(db, "products", currentProduct.id);
    const amountToChange = stockUpdate.type === 'add' ? stockUpdate.amount : -stockUpdate.amount;

    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(productRef);
        if (!sfDoc.exists()) throw "المنتج غير موجود!";
        
        const newStock = (sfDoc.data().stock || 0) + amountToChange;
        if (newStock < 0) throw "لا يمكن أن يكون المخزون أقل من صفر.";
        
        transaction.update(productRef, { stock: newStock });
      });
      toast({ title: "✅ تم تحديث المخزون" });
      setIsStockModalOpen(false);
    } catch (error) {
      toast({ title: "❌ خطأ في تحديث المخزون", description: error.toString(), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const openStockModal = (product) => {
    setCurrentProduct(product);
    setStockUpdate({ amount: 0, type: 'add' });
    setIsStockModalOpen(true);
  };

  const filteredProducts = products.filter(product =>
    (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
  if (error) return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <Package className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />
            إدارة المنتجات
        </h1>
        <Button variant="outline" onClick={() => navigate('/AdminDashboard')}>
            <ArrowRight className="ml-2 h-4 w-4" />
            الرجوع للوحة التحكم
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input type="text" placeholder="ابحث بالاسم أو الفئة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 rtl:pr-10 rtl:pl-3" />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setNewProduct({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' })}>
                    <PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg text-right">
                <DialogHeader><DialogTitle>إضافة منتج جديد</DialogTitle></DialogHeader>
                <ProductForm productData={newProduct} setProductData={setNewProduct} handleSubmit={handleSubmitProduct} isEdit={false} closeModal={() => setIsAddModalOpen(false)} isSubmitting={isSubmitting} />
            </DialogContent>
        </Dialog>
      </div>
      
      {/* ... جدول المنتجات ... */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-700/50">
            <TableRow>
              <TableHead className="text-right px-3 py-3.5">المنتج</TableHead>
              <TableHead className="text-right px-3 py-3.5">الفئة</TableHead>
              <TableHead className="text-right px-3 py-3.5">السعر</TableHead>
              <TableHead className="text-right px-3 py-3.5">المخزون</TableHead>
              <TableHead className="text-center px-3 py-3.5">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium flex items-center gap-3">
                    <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                    <span>{product.name}</span>
                </TableCell>
                <TableCell>{product.category || '-'}</TableCell>
                <TableCell>{product.price?.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</TableCell>
                <TableCell>
                    <span onClick={() => openStockModal(product)} className="cursor-pointer hover:underline">{product.stock}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف منتج "{product.name}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/80">حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg text-right">
          <DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>
          {currentProduct && <ProductForm productData={currentProduct} setProductData={setCurrentProduct} handleSubmit={handleSubmitProduct} isEdit={true} closeModal={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />}
        </DialogContent>
      </Dialog>
      
      {/* Update Stock Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-sm text-right">
          <DialogHeader><DialogTitle>تحديث المخزون لـ "{currentProduct?.name}"</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">المخزون الحالي: {currentProduct?.stock}</p>
          <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="flex gap-4">
                  <Input type="number" value={stockUpdate.amount} onChange={(e) => setStockUpdate(p => ({...p, amount: parseInt(e.target.value) || 0}))} min="0" required />
                  <select value={stockUpdate.type} onChange={(e) => setStockUpdate(p => ({...p, type: e.target.value}))} className="p-2 border rounded-md dark:bg-slate-700">
                      <option value="add">إضافة</option>
                      <option value="subtract">خصم</option>
                  </select>
              </div>
              <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>إلغاء</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : 'تحديث'}</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default ProductManagement;
