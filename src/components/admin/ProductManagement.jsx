// src/components/admin/ProductManagement.jsx (النسخة الكاملة والمحدثة)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// 🔥🔥 هنا تم إضافة "query" الناقصة 🔥🔥
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot, orderBy, query } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, Package, Loader2, AlertTriangle, Search, ImagePlus, X, ArrowRight, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress.jsx';

const ProductManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
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

    const handleInputChange = (e, formSetter) => {
        const { name, value } = e.target;
        formSetter(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast({ title: "ملف غير صالح", variant: "destructive" });
            return;
        }
        setImagePreview(URL.createObjectURL(file));
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.7 };
        try {
            const compressedFile = await imageCompression(file, options);
            setImageFile(compressedFile);
            toast({ title: "✅ الصورة جاهزة للرفع!"});
        } catch (error) {
            setImageFile(file);
        }
    };
    
    const resetImageState = () => {
        setImageFile(null);
        setImagePreview('');
        setUploadProgress(0);
        setIsUploading(false);
        const fileInput = document.getElementById('file-upload');
        if(fileInput) fileInput.value = '';
    };

    const uploadImageAndGetURL = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) { reject(new Error("No file provided.")); return; }
            setIsUploading(true);
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed',
                (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                (error) => { setIsUploading(false); reject(error); },
                () => getDownloadURL(uploadTask.snapshot.ref).then(url => { setIsUploading(false); resolve(url); })
            );
        });
    };

    const handleSubmitProduct = async (e, productData, isEdit = false) => {
        e.preventDefault();
        const dataToSubmit = {
            ...productData,
            price: parseFloat(productData.price) || 0,
            originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
            stock: parseInt(productData.stock, 10) || 0,
        };
        
        if (!dataToSubmit.name || dataToSubmit.price <= 0 || (!isEdit && !imageFile)) {
            toast({ title: "بيانات ناقصة", description: "الرجاء إدخال اسم وسعر وصورة المنتج.", variant: "destructive" });
            return;
        }
    
        try {
            let imageUrl = isEdit ? dataToSubmit.image : '';
            if (imageFile) imageUrl = await uploadImageAndGetURL(imageFile);
            
            if (isEdit) {
                const productRef = doc(db, 'products', productData.id);
                await updateDoc(productRef, { ...dataToSubmit, image: imageUrl });
                toast({ title: "✅ تم تعديل المنتج" });
                setIsEditModalOpen(false);
            } else {
                await addDoc(collection(db, 'products'), { ...dataToSubmit, image: imageUrl });
                toast({ title: "✅ تم إضافة المنتج" });
                setIsAddModalOpen(false);
                setNewProduct({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' });
            }
            resetImageState();
        } catch (err) {
            toast({ title: `❌ خطأ في ${isEdit ? 'التعديل' : 'الإضافة'}`, description: err.message, variant: "destructive" });
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
     if (!window.confirm(`هل أنت متأكد أنك تريد حذف المنتج "${productName}"؟`)) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "🗑️ تم حذف المنتج", className: "bg-red-500 text-white" });
    } catch (err) {
      toast({ title: "❌ خطأ في الحذف", description: err.message, variant: "destructive" });
    }
  };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!currentProduct) return;
        try {
            const productRef = doc(db, 'products', currentProduct.id);
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(productRef);
                if (!sfDoc.exists()) throw new Error("المنتج غير موجود!");
                let newStock = stockUpdate.type === 'add' ? (sfDoc.data().stock || 0) + Number(stockUpdate.amount) : Number(stockUpdate.amount);
                transaction.update(productRef, { stock: Math.max(0, newStock) });
            });
            toast({ title: "📦 تم تحديث المخزون" });
            setIsStockModalOpen(false);
        } catch (err) {
            toast({ title: "❌ خطأ في تحديث المخزون", variant: "destructive" });
        }
    };

    const openEditModal = (product) => {
        resetImageState();
        setCurrentProduct({ ...product, price: product.price.toString(), originalPrice: product.originalPrice ? product.originalPrice.toString() : '' });
        setImagePreview(product.image);
        setIsEditModalOpen(true);
    };

    const openStockModal = (product) => {
        setCurrentProduct(product);
        setStockUpdate({ amount: 0, type: 'add' });
        setIsStockModalOpen(true);
    };

    const renderProductForm = (productData, setProductData, handleSubmit, isEdit = false) => (
        <form onSubmit={(e) => handleSubmit(e, productData, isEdit)} className="space-y-4 text-right max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input id="name" name="name" value={productData.name} onChange={(e) => handleInputChange(e, setProductData)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" name="description" value={productData.description} onChange={(e) => handleInputChange(e, setProductData)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="price">السعر (ج.م)</Label><Input id="price" name="price" type="number" step="0.01" value={productData.price} onChange={(e) => handleInputChange(e, setProductData)} required /></div>
                <div className="space-y-2"><Label htmlFor="originalPrice">السعر الأصلي (اختياري)</Label><Input id="originalPrice" name="originalPrice" type="number" step="0.01" value={productData.originalPrice} onChange={(e) => handleInputChange(e, setProductData)} placeholder="لإظهار الخصم" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="category">الفئة</Label><Input id="category" name="category" value={productData.category} onChange={(e) => handleInputChange(e, setProductData)} /></div>
                <div className="space-y-2"><Label htmlFor="stock">المخزون</Label><Input id="stock" name="stock" type="number" value={productData.stock} onChange={(e) => handleInputChange(e, setProductData)} required /></div>
            </div>
            <div className="space-y-2">
                <Label>صورة المنتج</Label>
                <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer flex-grow"><Button type="button" variant="outline" className="w-full flex items-center justify-center"><ImagePlus className="mr-2 h-4 w-4" /> <span>تغيير الصورة</span></Button><Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>
                    {imagePreview && <div className="relative"><img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" /><Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={resetImageState}><X className="h-4 w-4" /></Button></div>}
                </div>
                {isUploading && <Progress value={uploadProgress} className="w-full mt-2" />}
            </div>
            <DialogFooter><Button type="submit" disabled={isUploading}>{isUploading ? 'جاري الرفع...' : 'حفظ المنتج'}</Button></DialogFooter>
        </form>
    );
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
    if (error) return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center"><Package className="mr-3 rtl:ml-3 rtl:mr-0" size={32} />إدارة المنتجات</h1>
                <Button variant="outline" onClick={() => navigate('/AdminDashboard')}><ArrowRight className="ml-2 h-4 w-4" />الرجوع للوحة التحكم</Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-auto"><Search className="absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="ابحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm pl-10 rtl:pr-10" /></div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}><DialogTrigger asChild><Button onClick={() => { resetImageState(); setIsAddModalOpen(true); }}><PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج</Button></DialogTrigger><DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle>إضافة منتج جديد</DialogTitle></DialogHeader>{renderProductForm(newProduct, setNewProduct, handleSubmitProduct)}</DialogContent></Dialog>
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>المنتج</TableHead>
                            <TableHead>الفئة</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>المخزون</TableHead>
                            <TableHead className="text-center">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium flex items-center gap-3"><img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md" /><span>{product.name}</span></TableCell>
                                <TableCell>{product.category || 'N/A'}</TableCell>
                                <TableCell>{product.price.toLocaleString()} ج.م</TableCell>
                                <TableCell><Button variant="ghost" onClick={() => openStockModal(product)}>{product.stock}</Button></TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteProduct(product.id, product.name)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}><DialogContent className="sm:max-w-lg text-right"><DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>{currentProduct && renderProductForm(currentProduct, setCurrentProduct, handleSubmitProduct, true)}</DialogContent></Dialog>
            
            <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                <DialogContent className="sm:max-w-md text-right">
                    <DialogHeader><DialogTitle>تحديث مخزون: {currentProduct?.name}</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateStock} className="space-y-4 pt-4">
                        <div className="flex items-center gap-4">
                            <select value={stockUpdate.type} onChange={e => setStockUpdate(p => ({ ...p, type: e.target.value }))} className="p-2 border rounded-md dark:bg-slate-700">
                                <option value="add">إضافة</option>
                                <option value="set">تعيين إلى</option>
                            </select>
                            <Input type="number" value={stockUpdate.amount} onChange={e => setStockUpdate(p => ({ ...p, amount: e.target.value }))} required />
                        </div>
                        <DialogFooter><Button type="submit">تحديث المخزون</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </motion.div>
    );
};

export default ProductManagement;
