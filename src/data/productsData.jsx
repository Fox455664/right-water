// src/pages/ProductsPage.jsx (الحل النهائي)

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { productCategories } from '@/data/productsDatajsx'; // استيراد البيانات من ملفك

// Component لكارت المنتج
const ProductCard = ({ product }) => (
  <div className="bg-card/50 border rounded-lg overflow-hidden flex flex-col h-full glassmorphism-card">
    <div className="aspect-square bg-muted overflow-hidden">
      <img
        src={product.image}
        alt={product.altText}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
    <div className="p-4 flex-grow flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        {product.icon}
        <h3 className="font-bold text-foreground text-base">{product.name}</h3>
      </div>
      <p className="text-muted-foreground text-sm flex-grow">{product.description}</p>
    </div>
  </div>
);

const ProductsPage = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* ======================================================= */}
      {/* ✅ الشريط اللاصق (Sidebar على الديسكتوب وشريط أفقي على الموبايل) ✅ */}
      {/* ======================================================= */}
      <aside className="lg:w-64 lg:h-screen lg:sticky lg:top-0 flex-shrink-0">
        <div className="p-4 sticky top-16 lg:top-0 bg-background/80 backdrop-blur-sm z-20 border-b lg:border-b-0 lg:border-r">
          <h2 className="text-xl font-bold mb-4 hidden lg:block text-primary">أقسام المنتجات</h2>
          {/* على الموبايل: شريط أفقي قابل للتمرير */}
          <div className="lg:hidden flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
            {productCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground font-semibold transition-colors"
              >
                {category.icon}
                <span>{category.title}</span>
              </a>
            ))}
          </div>
          {/* على الديسكتوب: قائمة رأسية */}
          <nav className="hidden lg:flex flex-col space-y-2">
            {productCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-foreground"
              >
                {category.icon}
                <span className="font-medium">{category.title}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* ======================================================= */}
      {/* ✅ المحتوى الرئيسي (قائمة المنتجات) ✅ */}
      {/* ======================================================= */}
      <main className="flex-grow p-4 md:p-8">
        <div className="space-y-12">
          {productCategories.map((category, index) => (
            <motion.section
              key={category.id}
              id={category.id} // هذا الـ ID هو ما يجعل الرابط يعمل
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="scroll-mt-24" // يضيف مسافة عند القفز للقسم عشان ما يجيش تحت الشريط
            >
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                    {React.cloneElement(category.icon, { size: 32 })}
                </div>
                <h2 className="text-3xl font-extrabold text-primary">{category.title}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {category.products.map((product) => (
                  <ProductCard key={product.name} product={product} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
