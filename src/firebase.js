// uploadProducts.js - (النسخة النهائية المتوافقة مع ملف firebase.js المركزي)

import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/firebase.js'; // ✅ يستورد db من ملفك المركزي مباشرة
import { productCategories } from './src/data/productsData.js'; // تأكد من مسار ملف البيانات

// الدالة الرئيسية لرفع البيانات
async function uploadData() {
  console.log("🚀 بدء عملية رفع المنتجات إلى Firestore...");

  const productsCollectionRef = collection(db, 'products');
  const batch = writeBatch(db);
  let productsCount = 0;

  productCategories.forEach(category => {
    if (category.products && category.products.length > 0) {
      category.products.forEach(product => {
        const newProductRef = doc(productsCollectionRef);

        // بناء هيكل المنتج النهائي
        const productData = {
          name: product.name || "اسم غير متوفر",
          description: product.description || "وصف غير متوفر",
          image: product.image || "https://via.placeholder.com/400",
          altText: product.altText || product.name,
          
          price: product.price || 0,
          originalPrice: product.originalPrice || null,
          stock: product.stock || 50,
          rating: product.rating || 5,
          reviews: product.reviews || 0,
          
          categoryId: category.id,
          categoryTitle: category.title,

          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        batch.set(newProductRef, productData);
        productsCount++;
      });
    }
  });

  if (productsCount === 0) {
    console.log("⚠️ لم يتم العثور على منتجات لرفعها. تأكد من أن ملف البيانات ليس فارغًا.");
    return;
  }

  try {
    await batch.commit();
    console.log(`✅ نجاح! تم رفع ${productsCount} منتجًا بنجاح إلى قاعدة البيانات.`);
    console.log("👍 العملية تمت بنجاح.");
  } catch (error) {
    console.error("❌ فشل في رفع البيانات:", error);
  }
}

// تشغيل الدالة
uploadData();
