// src/pages/CategoryPage.jsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { productCategories } from '@/data/productsData.jsx'; // استيراد البيانات من الملف الذي أنشأناه
import { Button } from '@/components/ui/button';

// مكون عرض المنتج الواحد بتصميم جذاب
const ProductCard = ({ product, index }) => (
    <motion.div 
        className="bg-card border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
    >
        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
            <img src={product.image} alt={product.altText} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-3 mb-3 text-primary">
                {product.icon}
                <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
            </div>
            <p className="text-muted-foreground flex-grow mb-4">{product.description}</p>
            <Button className="w-full mt-auto">اطلب عرض سعر</Button>
        </div>
    </motion.div>
);

const CategoryPage = () => {
    const { categoryId } = useParams();
    const category = productCategories.find(cat => cat.id === categoryId);

    if (!category) {
        return (
            <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-5xl font-bold mb-4">الفئة غير موجودة</h1>
                <p className="text-xl text-muted-foreground mb-8">عذرًا، لم نتمكن من العثور على صفحة المنتجات التي تبحث عنها.</p>
                <Link to="/">
                    <Button size="lg">
                        <Home className="ml-2 h-5 w-5" />
                        العودة للرئيسية
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 dark:bg-background">
            <div className="container mx-auto px-4 py-16">
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                        {category.icon}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {category.title}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        تصفح مجموعتنا الكاملة من منتجات "{category.title}" عالية الجودة والمصممة لضمان أفضل أداء وموثوقية.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {category.products.map((product, index) => (
                        <ProductCard
                            key={index}
                            product={product}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
