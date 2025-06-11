// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { productId } = useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">تفاصيل المنتج</h1>
      <p className="mt-4">جاري تحميل تفاصيل المنتج رقم: {productId}</p>
      {/* هنا سنضيف الكود لجلب وعرض تفاصيل المنتج لاحقاً */}
    </div>
  );
};

export default ProductDetailPage;
