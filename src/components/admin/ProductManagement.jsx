// src/components/admin/ProductManagement.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, updateDoc, addDoc, deleteDoc, runTransaction, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'; // 🔥 إضافة serverTimestamp
import imageCompression from 'browser-image-compression';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.jsx";
import { PlusCircle, Edit, Trash2, Package, Loader2, AlertTriangle, Search, ImagePlus, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress.jsx';

const ProductForm = ({ /* ...props */ }) => {
  // ... (الكود الداخلي للنموذج كما هو)
};

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
  const fileInputRef = useRef(null);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        toast({ title: "ملف غير صالح", description: "يرجى اختيار ملف صورة.", variant: "destructive" });
        return;
    }
    setImagePreview(URL.createObjectURL(file));
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, initialQuality: 0.7 };
    try {
        toast({ title: "جاري ضغط الصورة..." });
        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        toast({ title: "✅ الصورة جاهزة للرفع!", className: "bg-green-500 text-white" });
    } catch (error) {
        setImageFile(file);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setIsUploading(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImageAndGetURL = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error("No file provided.")); return; }
      setIsUploading(true);
      setUploadProgress(0);
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => { setIsUploading(false); reject(error); },
        () => getDownloadURL(uploadTask.snapshot.ref).then(url => { setIsUploading(false); resolve(url); })
      );
    });
  };

  // 🔥🔥 بداية التعديل على دالة الإضافة والتعديل 🔥🔥
  const handleSubmitProduct = async (e, productData, isEdit = false) => {
    e.preventDefault();
    const dataToSubmit = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      stock: parseInt(productData.stock, 10) || 0,
      updatedAt: serverTimestamp(), // تحديث تاريخ التعديل دائمًا
    };

    if (!isEdit) {
      dataToSubmit.createdAt = serverTimestamp(); // إضافة تاريخ الإنشاء فقط عند الإضافة
    }

    if (!dataToSubmit.name || dataToSubmit.price <= 0 || (!isEdit && !imageFile)) {
      toast({ title: "بيانات ناقصة", description: "الرجاء إدخال اسم وسعر وصورة المنتج.", variant: "destructive" });
      return;
    }

    try {
      let imageUrl = isEdit ? dataToSubmit.image : '';
      if (imageFile) {
        imageUrl = await uploadImageAndGetURL(imageFile);
      }
      dataToSubmit.image = imageUrl; // التأكد من تحديث رابط الصورة

      if (isEdit) {
        const productRef = doc(db, 'products', productData.id);
        await updateDoc(productRef, dataToSubmit);
        toast({ title: "✅ تم تعديل المنتج" });
        setIsEditModalOpen(false);
      } else {
        await addDoc(collection(db, 'products'), dataToSubmit);
        toast({ title: "✅ تم إضافة المنتج" });
        setIsAddModalOpen(false);
        setNewProduct({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' });
      }
      resetImageState();
    } catch (err) {
      toast({ title: `❌ خطأ في ${isEdit ? 'التعديل' : 'الإضافة'}`, description: err.message, variant: "destructive" });
    }
  };
  // 🔥🔥 نهاية التعديل 🔥🔥

  // ... باقي الدوال كما هي ...
  const handleDeleteProduct = async (productId) => { /* ... */ };
  const handleUpdateStock = async (e) => { /* ... */ };
  const openEditModal = (product) => { /* ... */ };
  const openStockModal = (product) => { /* ... */ };

  const filteredProducts = products.filter(product =>
    (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">جاري تحميل المنتجات...</p></div>;
  if (error) return <div className="p-10 text-center"><AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-lg text-destructive">{error}</p></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* ... باقي واجهة المستخدم كما هي ... */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => { resetImageState(); setNewProduct({ name: '', category: '', price: '', description: '', image: '', stock: 0, originalPrice: '' }); setIsAddModalOpen(true); }}>
            <PlusCircle className="mr-2 h-5 w-5" /> إضافة منتج
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg text-right">
          <DialogHeader><DialogTitle>إضافة منتج جديد</DialogTitle></DialogHeader>
          <ProductForm 
            productData={newProduct} 
            setProductData={setNewProduct} 
            handleSubmit={handleSubmitProduct} 
            isEdit={false} 
            imagePreview={imagePreview} 
            handleImageChange={handleImageChange} 
            resetImageState={resetImageState} 
            isUploading={isUploading} 
            uploadProgress={uploadProgress} 
          />
        </DialogContent>
      </Dialog>
      {/* ... */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg text-right">
          <DialogHeader><DialogTitle>تعديل المنتج</DialogTitle></DialogHeader>
          {currentProduct && 
            <ProductForm 
              productData={currentProduct} 
              setProductData={setCurrentProduct} 
              handleSubmit={handleSubmitProduct} 
              isEdit={true} 
              imagePreview={imagePreview} 
              handleImageChange={handleImageChange} 
              resetImageState={resetImageState} 
              isUploading={isUploading} 
              uploadProgress={uploadProgress} 
            />
          }
        </DialogContent>
      </Dialog>
      {/* ... */}
    </motion.div>
  );
};

export default ProductManagement;
