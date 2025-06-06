import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase"; // عدل المسار حسب مشروعك

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب المنتجات من Firestore عند تحميل الصفحة
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCol = collection(db, "products");
      const productsSnapshot = await getDocs(productsCol);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setProducts(productsList);
    };
    fetchProducts();
  }, []);

  // إضافة منتج إلى السلة
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // زيادة الكمية مع التأكد من عدم تجاوز المخزون
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          alert("لا يوجد كمية كافية في المخزون");
          return prev;
        }
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // حذف منتج من السلة
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // عملية الشراء مع التحقق من المخزون
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("السلة فارغة");
      return;
    }

    setLoading(true);

    try {
      // تحقق من المخزون لكل منتج
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          alert(`المنتج ${item.name} غير موجود.`);
          setLoading(false);
          return;
        }

        const productData = productSnap.data();
        if (productData.stock < item.quantity) {
          alert(
            `الكمية المطلوبة من ${item.name} غير متاحة. المتاح: ${productData.stock}`
          );
          setLoading(false);
          return;
        }
      }

      // حساب المجموع الكلي
      const totalPrice = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      // بيانات العميل (يمكن تعديلها لتكون من فورم)
      const customerName = prompt("ادخل اسمك:");
      const customerPhone = prompt("ادخل رقم هاتفك:");
      const customerAddress = prompt("ادخل عنوانك:");

      if (!customerName || !customerPhone || !customerAddress) {
        alert("الرجاء ملء جميع بيانات العميل");
        setLoading(false);
        return;
      }

      // أضف الطلب إلى Firestore
      const order = {
        items: cart,
        total: totalPrice,
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), order);

      // حدث المخزون
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();

        await updateDoc(productRef, {
          stock: productData.stock - item.quantity,
        });
      }

      alert("تم تنفيذ الطلب بنجاح!");
      setCart([]);
    } catch (error) {
      console.error("خطأ أثناء تنفيذ الطلب:", error);
      alert("حدث خطأ، الرجاء المحاولة لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>المنتجات</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - السعر: {product.price} - الكمية المتاحة:{" "}
            {product.stock}
            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product)}
              style={{ marginLeft: "10px" }}
            >
              {product.stock === 0 ? "نفذ المخزون" : "أضف إلى السلة"}
            </button>
          </li>
        ))}
      </ul>

      <h2>سلة الشراء</h2>
      {cart.length === 0 && <p>السلة فارغة</p>}
      {cart.length > 0 && (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} - الكمية: {item.quantity} - السعر: {item.price}{" "}
              <button onClick={() => removeFromCart(item.id)}>حذف</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "جاري تنفيذ الطلب..." : "شراء"}
      </button>
    </div>
  );
};

export default Shop;
