// src/pages/ArticlesPage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, ShieldOff, HeartPulse, Sparkles, ShoppingCart, Layers3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- مكونات عرض المنتجات ---
const ProductItem = ({ name, description, image, altText }) => (
    <div className="bg-background/80 dark:bg-zinc-900/80 p-4 rounded-lg border flex flex-col sm:flex-row items-start gap-4 hover:shadow-lg transition-shadow duration-300">
      <div className="w-full sm:w-24 h-24 flex-shrink-0">
         <img 
            src={image} 
            alt={altText || name}
            className="w-full h-full object-cover rounded-md" 
            loading="lazy"
          />
      </div>
      <div className="flex-grow">
        <h5 className="font-bold text-lg text-foreground">{name}</h5>
        <p className="text-sm text-muted-foreground mt-1 mb-2 leading-relaxed">{description}</p>
        <p className="font-semibold text-primary text-base">اطلب عرض سعر</p>
      </div>
    </div>
);
  
// --- بيانات جميع المنتجات الكاملة والمفصلة ---
const productCategories = [
    {
      category: "شمعة أولى (PP)",
      products: [
        { name: "شمعة أولى 65 جرام", description: "شمعة PP أساسية بجودة عالية لإزالة الرواسب.", image: "https://images.unsplash.com/photo-1617953141905-65c8612311fd?w=500", altText: "شمعة فلتر أولى 65 جرام" },
        { name: "شمعة أولى 90 جرام", description: "شمعة PP بكثافة أعلى لعمر أطول.", image: "https://images.unsplash.com/photo-1615174010339-c13681427116?w=500", altText: "شمعة فلتر أولى 90 جرام" },
        { name: "شمعة أولى 100 جرام رايت ووتر", description: "شمعة رايت ووتر الأصلية، تضمن أفضل حماية.", image: "https://images.unsplash.com/photo-1605005858998-e7f33d3c909e?w=500", altText: "شمعة فلتر أولى 100 جرام رايت ووتر" },
        { name: "شمعة أولى 110 جرام رايت ووتر", description: "كفاءة فائقة وعمر افتراضي ممتد.", image: "https://images.unsplash.com/photo-1599493356805-3cd47690f679?w=500", altText: "شمعة فلتر أولى 110 جرام" },
        { name: "شمعة أولى 125 جرام رايت ووتر", description: "أعلى جودة في فئتها لحماية لا تضاهى.", image: "https://images.unsplash.com/photo-1556740738-b6a63e2775d2?w=500", altText: "شمعة فلتر أولى 125 جرام" },
        { name: "شمعة أولى 135 جرام رايت ووتر", description: "الأكثر كثافة، مصممة للمياه الصعبة.", image: "https://images.unsplash.com/photo-1617953141905-65c8612311fd?w=500", altText: "شمعة فلتر أولى 135 جرام" },
        { name: "شمعة أولى 20 بوصه", description: "للفلتر المركزي أو التجاري، بحجم 20 بوصة.", image: "https://images.unsplash.com/photo-1623990088169-3eafccdec2c0?w=500", altText: "شمعة فلتر أولى 20 بوصة" },
        { name: "شمعة أولى جامبو", description: "للفلتر المركزي الجامبو، بأعلى قدرة.", image: "https://images.unsplash.com/photo-1599493356805-3cd47690f679?w=500", altText: "شمعة فلتر أولى جامبو" },
        { name: "شمعة أولى كومبكت تركي", description: "شمعة مدمجة (Inline) صناعة تركية.", image: "https://images.unsplash.com/photo-1605005858998-e7f33d3c909e?w=500", altText: "شمعة فلتر أولى كومبكت تركي" },
        { name: "شمعة أولى كومبكت صيني", description: "شمعة مدمجة (Inline) صناعة صينية.", image: "https://images.unsplash.com/photo-1615174010339-c13681427116?w=500", altText: "شمعة فلتر أولى كومبكت صيني" },
      ],
    },
    {
      category: "شمعة ثانية (GAC - كربون حبيبي)",
      products: [
          { name: "رايت ووتر كاب أخضر", description: "شمعة كربون نشط من رايت ووتر لإزالة الكلور.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثانية رايت ووتر" },
          { name: "رايت ووتر كاب أزرق", description: "إصدار آخر من شمعة رايت ووتر الثانية.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثانية رايت ووتر كاب أزرق" },
          { name: "رايت ووتر مصري", description: "شمعة GAC صناعة مصرية من رايت ووتر.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثانية صناعة مصرية" },
          { name: "فيتنامي", description: "شمعة GAC فيتنامية المنشأ بكفاءة عالية.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثانية فيتنامي" },
          { name: "أكوافلتر", description: "شمعة GAC من أكوافلتر الأوروبية.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثانية أكوافلتر" },
          { name: "أكواوين", description: "شمعة كربونية عالية الأداء من أكواوين.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثانية أكواوين" },
          { name: "كويك سيلفر", description: "شمعة GAC من كويك سيلفر لامتصاص الكلور.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثانية كويك سيلفر" },
          { name: "مصري", description: "شمعة كربون حبيبي صناعة مصرية.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثانية صناعة مصرية" },
          { name: "تروبيكال", description: "شمعة كربونية من تروبيكال لتحسين الطعم.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثانية تروبيكال" },
          { name: "وينتر", description: "شمعة GAC من وينتر لأداء موثوق.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثانية وينتر" },
          { name: "توب ووتر", description: "شمعة كربونية من توب ووتر لنقاء عالي.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثانية توب ووتر" },
          { name: "باور جيت", description: "شمعة GAC من باور جيت لإزالة فعالة للكلور.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثانية باور جيت" },
          { name: "كومبكت تركي", description: "شمعة GAC مدمجة (Inline) صناعة تركية.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثانية كومبكت تركي" },
          { name: "20 بوصه", description: "شمعة GAC بحجم 20 بوصة للفلتر المركزي.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثانية 20 بوصة" },
          { name: "جامبو", description: "شمعة GAC بحجم جامبو للفلتر المركزي.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثانية جامبو" }
      ]
    },
    {
      category: "شمعة ثالثة (CTO) والمراحل العليا",
      products: [
        { name: "شمعة ثالثة رايت ووتر (أخضر/أزرق/مصري)", description: "شمعات CTO من رايت ووتر لتأكيد إزالة الكلور.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة ثالثة رايت ووتر" },
        { name: "شمعة ثالثة فيتنامي/أكوافلتر/أكواوين/كويك سيلفر", description: "ماركات عالمية من شمعات الكربون الصلب.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة ثالثة ماركات عالمية" },
        { name: "شمعة ثالثة بولي بكاب/تروبيكال", description: "خيارات إضافية من شمعات المرحلة الثالثة.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة ثالثة بولي بكاب" },
        { name: "بوست كربون (نيو جيت / استيفوا)", description: "شمعة المرحلة الخامسة لتحسين الطعم النهائي.", image: "https://images.unsplash.com/photo-1574974641320-3052d43e9e31?w=500", altText: "شمعة بوست كربون" },
        { name: "كالسيت (نيو جيت / استيفوا / تركي / فيتنامي / صيني / مصري)", description: "شمعة المرحلة السادسة لإضافة المعادن.", image: "https://images.unsplash.com/photo-1619178490333-abd4036b1a37?w=500", altText: "شمعة كالسيت" },
        { name: "إنفراريد (نيو جيت / استيفوا / فيتنامي / صيني / مصري)", description: "شمعة المرحلة السابعة لتنشيط جزيئات الماء.", image: "https://images.unsplash.com/photo-1574974641320-3052d43e9e31?w=500", altText: "شمعة إنفراريد" },
      ]
    },
    {
      category: "هياكل الفلاتر (هاوزنج)",
      products: [
        { name: "طقم هاوزنج فيتنامي CCK", description: "طقم هاوزنج فيتنامي أصلي من CCK.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج فيتنامي CCK" },
        { name: "طقم هاوزنج سوان إيكوا", description: "طقم هاوزنج عالي الجودة من سوان إيكوا.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج سوان إيكوا" },
        { name: "طقم هاوزنج جاكوار (أبيض/شفاف)", description: "طقم هاوزنج جاكوار متوفر باللون الأبيض والشفاف.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج جاكوار" },
        { name: "هاوزنج فيتنامي CCK (أبيض/شفاف)", description: "قطع هاوزنج فردية فيتنامية.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج فيتنامي فردي" },
        { name: "هاوزنج سوان إيكوا (أبيض/شفاف)", description: "قطع هاوزنج فردية من سوان إيكوا.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج سوان إيكوا فردي" },
        { name: "هاوزنج جامبو / 20 بوصة (فيتنامي/صيني)", description: "هاوزنجات للأحجام الكبيرة والفلاتر المركزية.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج جامبو و 20 بوصة" },
      ]
    },
    {
      category: "شاسيهات وقواعد الفلاتر",
      products: [
        { name: "شاسيه بلاستيك أسود", description: "قاعدة بلاستيكية سوداء لتثبيت الفلتر.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه بلاستيك أسود" },
        { name: "شاسيه بلاستيك RO رايت ووتر (أبيض/أزرق/برتقالي)", description: "شاسيهات RO من رايت ووتر بألوان متعددة.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه RO رايت ووتر" },
        { name: "شاسيه بوكس", description: "تصميم مغلق بالكامل لحماية مكونات الفلتر.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه بوكس" },
        { name: "شاسيه خماسي معدن", description: "قاعدة معدنية قوية للفلتر الخماسي.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه معدن خماسي" },
        { name: "شاسيه RO (أبيض/أزرق/برتقالي/أسود)", description: "قواعد فلاتر RO متوفرة بجميع الألوان.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه RO" },
        { name: "شاسيه خماسي (أبيض/أسود)", description: "قواعد فلاتر خماسية باللونين الأبيض والأسود.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه خماسي" },
      ]
    },
    {
      category: "فلاتر كاملة",
      products: [
        { name: "فلتر خماسي رايت برتقالي", description: "نظام فلتر 5 مراحل كامل من رايت ووتر.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "فلتر خماسي رايت" },
        { name: "فلتر خماسي ووتر لايف (سوان/CCK/جاكوار)", description: "أنظمة فلترة 5 مراحل من ووتر لايف.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "فلتر خماسي ووتر لايف" },
        { name: "فلتر خماسي (أزرق/خشبي/جاكوار)", description: "فلاتر 5 مراحل بتصميمات وألوان متنوعة.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "فلتر 5 مراحل" },
        { name: "فلتر ثلاثي رايت / رايت دايفورتر", description: "فلتر 3 مراحل أساسي لإزالة الشوائب والكلور.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "فلتر 3 مراحل" },
      ]
    },
    {
      category: "حنفيات، محابس، ووصلات",
      products: [
        { name: "حنفية (ثلاثي/لوكس مذهبة/لوكس فضي/هاند مكسر)", description: "حنفيات أنيقة من الاستانلس والنحاس.", image: "https://images.unsplash.com/photo-1599837563398-0584b4e3e316?w=500", altText: "حنفية فلتر مياه" },
        { name: "محبس (دخول بلاستيك/دخول معدن/مباشر/خزان)", description: "محابس للتحكم في مسار المياه.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "محابس فلاتر" },
        { name: "كوع (ربع/مضخة/ممبرين/شيك بلف/ثلاثي تيل)", description: "جميع أنواع الأكواع ووصلات التركيب.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "وصلات وأكواع فلاتر" },
        { name: "صباع صرف (صيني/تايواني)", description: "وصلات خاصة بالتركيب على خط الصرف.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "صباع صرف" },
        { name: "نترة (بلاستيك/بمحبس/معدن/ألمنيوم)", description: "وصلات دخول المياه بأحجام مختلفة.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "نترة دخول مياه" },
      ]
    },
    {
      category: "مضخات، خزانات، وأدوات كهربائية",
      products: [
        { name: "مضخة (صيني/هندي كروز/هندي هاي ليف/هيدون)", description: "مضخات لرفع ضغط المياه لضمان أداء الممبرين.", image: "https://images.unsplash.com/photo-1631124849761-365751993466?w=500", altText: "مضخة فلتر مياه" },
        { name: "ترانس (إلكتروني/مختوم/رايت ووتر)", description: "محولات كهربائية آمنة لتشغيل المضخة.", image: "https://images.unsplash.com/photo-1631124849761-365751993466?w=500", altText: "ترانس فلتر مياه" },
        { name: "خزان (صيني/فيتنامي) - جالون، 3.2، 5 جالون", description: "خزانات تخزين المياه النقية بأحجام مختلفة.", image: "https://images.unsplash.com/photo-1557683316-9694a869784f?w=500", altText: "خزان فلتر مياه" },
        { name: "هاي و لو و رباعي (تايواني/صيني/مختوم)", description: "مفاتيح ضغط لتشغيل وفصل المضخة أوتوماتيكيًا.", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500", altText: "مفتاح ضغط هاي ولو" },
        { name: "TDS جهاز / جهاز أقطاب", description: "أجهزة لقياس نسبة الأملاح وجودة المياه.", image: "https://images.unsplash.com/photo-1631124849761-365751993466?w=500", altText: "جهاز قياس TDS" },
      ]
    },
    {
      category: "ملحقات وقطع غيار متنوعة",
      products: [
        { name: "مفتاح هاوزنج (عادي/رايت/جامبو)", description: "أداة لفك وربط الهاوزنج عند تغيير الشمعات.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "مفتاح هاوزنج" },
        { name: "جوان (هاوزنج/كابات)", description: "قطع غيار لمنع التسريب.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "جوان فلتر" },
        { name: "طبق ثلاثي", description: "قطعة لربط الثلاث شمعات الأولى معًا.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "طبق ثلاثي" },
        { name: "هاوزنج ممبرين (صيني/تركي/فيتنامي)", description: "الهيكل الخارجي لغشاء الممبرين.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج ممبرين" },
        { name: "لفة خرطوم (100 متر/300 متر)", description: "خراطيم عالية الجودة للتركيبات.", image: "https://images.unsplash.com/photo-1557683316-9694a869784f?w=500", altText: "خرطوم فلتر مياه" },
        { name: "قارورة توصيل مباشر (مصري/صيني/فيتنامي)", description: "للتوصيل المباشر من الفلتر إلى مبردات المياه.", image: "https://images.unsplash.com/photo-1581338873211-5714acdb459b?w=500", altText: "قارورة توصيل مباشر" },
        { name: "غطاء بوكس وجراب فلتر", description: "أغطية وجرابات لحماية الفلتر.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "غطاء فلتر" },
      ]
    },
    {
      category: "كرتون وعبوات تغليف",
      products: [
        { name: "كرتونة ثلاثي (رايت/خشبي)", description: "كرتون لتغليف الفلتر الثلاثي.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة فلتر ثلاثي" },
        { name: "كرتونة خماسي (أزرق/خشبي/رايت/بريمو/جاكوار)", description: "كرتون لتغليف الفلتر الخماسي.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة فلتر خماسي" },
        { name: "كرتونة خماسي ووتر لايف (لبني/عادي)", description: "كرتون مخصص لفلتر ووتر لايف.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة فلتر ووتر لايف" },
        { name: "كرتونة RO/فلترة (أزرق/أخضر)", description: "كرتون عام لأنظمة RO والفلاتر.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة فلتر RO" },
        { name: "كرتونة طقم/عبوة شمع/هاوزنج غسالة", description: "كرتون مخصص لقطع الغيار.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة قطع غيار" },
        { name: "كرتونة بوكس (ووتر بوكس/ساده/ساده 5 راق)", description: "كرتون مخصص للفلاتر البوكس.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة فلتر بوكس" },
      ]
    },
];

const AllProductsAccordion = () => (
    <div className="w-full">
        <p className="mb-6 text-base">
            في رايت ووتر، نفخر بتقديم كتالوج شامل من <strong>شمعات الفلاتر</strong>، قطع الغيار، والأنظمة الكاملة التي تضمن لك الحصول على مياه نقية وصحية. تصفح فئات منتجاتنا أدناه للعثور على ما تحتاجه بالضبط.
        </p>
        <Accordion type="single" collapsible className="w-full">
            {productCategories.map((category, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-xl hover:no-underline text-right">
                        <div className="flex justify-between w-full items-center">
                            <span>{category.category}</span>
                            <span className="text-sm text-muted-foreground mr-auto pl-4">{category.products.length} منتجات</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-1 gap-4 pt-4">
                            {category.products.map((product, pIndex) => (
                                <ProductItem
                                    key={pIndex}
                                    name={product.name}
                                    description={product.description}
                                    image={product.image}
                                    altText={product.altText}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </div>
);


// 🔥🔥🔥 تم إصلاح الخطأ: تعريف واحد فقط لمصفوفة المقالات هنا 🔥🔥🔥
const articles = [
  {
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    title: "جسمك يصرخ طلبًا للماء النقي! هل تسمعه؟",
    image: "https://envs.sh/hEO.jpg",
    content: (
      <>
        <p className="mb-4">كل خلية، كل نسيج، وكل عضو في جسمك يعتمد بشكل أساسي على الماء ليعمل بكفاءة. لكن هل أي ماء يفي بالغرض؟ بالطبع لا! الماء النقي الخالي من الشوائب ليس مجرد سائل، بل هو وقود الحياة الذي يمنحك الطاقة، يحسن من تركيزك، يطرد السموم، ويمنح بشرتك نضارة لا مثيل لها. تجاهل هذه الحقيقة يعني حرمان جسمك من أهم عنصر يحتاجه للبقاء بصحة ممتازة.</p>
        <p className="font-semibold text-primary">الخلاصة: لا ترضى بأقل من الأفضل. صحتك تبدأ من كوب الماء الذي تشربه.</p>
      </>
    ),
  },
  {
    icon: <ShieldOff className="h-10 w-10 text-red-500" />,
    title: "العدو الخفي: ما لا تراه في المياه الملوثة",
    image: "https://envs.sh/hEM.jpg",
    content: (
        <>
            <p className="mb-4">قد تبدو مياه الصنبور صافية، لكن تحت السطح قد يكمن عالم من الملوثات غير المرئية: الكلور الذي يسبب الجفاف والتهيج، الصدأ من الأنابيب القديمة، الرصاص الذي يؤثر على الجهاز العصبي، بالإضافة إلى البكتيريا والفيروسات التي لا تراها بالعين المجردة. هذه الملوثات تتراكم في جسمك يومًا بعد يوم، مسببة مشاكل صحية قد لا تظهر إلا بعد فوات الأوان. هل أنت مستعد للمخاطرة بصحة عائلتك؟</p>
            <p className="font-semibold text-destructive">الحقيقة المرة: كل كوب ماء غير مفلتر قد يكون خطوة نحو مشاكل صحية أنت في غنى عنها.</p>
        </>
    ),
  },
  {
    icon: <Layers3 className="h-10 w-10 text-secondary" />,
    title: "فك شفرة فلاتر المياه: من 3 مراحل إلى 7 مراحل (RO)",
    image: "https://images.unsplash.com/photo-1623990088169-3eafccdec2c0?w=500&auto=format&fit=crop&q=60",
    content: (
      <div className="space-y-4 text-right">
        <p className="mb-4">عالم فلاتر المياه قد يبدو معقدًا، لكننا هنا لتبسيطه لك. كل مرحلة في الفلتر لها دور حاسم في رحلة تحويل مياه الصنبور العادية إلى مياه شرب صحية ونقية:</p>
        <div>
          <h4 className="font-bold text-primary">فلتر 3 مراحل (الحماية الأساسية):</h4>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>المرحلة الأولى (فلتر الرواسب):</strong> تعمل كحارس البوابة، تزيل الشوائب الكبيرة مثل الصدأ، الرمال، والأتربة.</li>
            <li><strong>المرحلة الثانية (فلتر كربوني حبيبي):</strong> تمتص الكلور والروائح والألوان غير المرغوب فيها، لتحسين طعم الماء ورائحته بشكل فوري.</li>
            <li><strong>المرحلة الثالثة (فلتر كربوني صلب):</strong> تؤكد على عمل المرحلة الثانية وتزيل أدق بقايا الكلور والمواد العضوية.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-primary">فلتر 5 مراحل (النقاء المتقدم):</h4>
          <p>يضيف مرحلتين حيويتين بعد المراحل الثلاث الأولى:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>المرحلة الرابعة (الممبرين - التناضح العكسي RO):</strong> هذه هي قلب النظام! غشاء دقيق بمسامية متناهية الصغر لا يسمح بمرور أي شيء تقريبًا سوى جزيئات الماء النقي، مما يزيل الأملاح الذائبة، المعادن الثقيلة، الفيروسات، والبكتيريا.</li>
            <li><strong>المرحلة الخامسة (فلتر ما بعد الكربون):</strong> اللمسة الأخيرة التي تضمن إزالة أي طعم أو رائحة قد تكون ناتجة عن خزان المياه وتمنح الماء طعمًا منعشًا.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-primary">فلتر 7 مراحل (الصحة المتكاملة):</h4>
          <p>يأخذ النقاء إلى مستوى جديد بإضافة معادن مفيدة بعد التنقية الكاملة:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>المرحلة السادسة (الكالسيت):</strong> تعيد إضافة المعادن الأساسية والأملاح المفيدة للجسم مثل الكالسيوم والمغنيسيوم، مما يحسن من قلوية الماء ويجعله صحيًا أكثر.</li>
            <li><strong>المرحلة السابعة (الأشعة تحت الحمراء):</strong> تعمل على تنشيط جزيئات الماء وتحسين قدرة الجسم على امتصاص الأكسجين، مما يعزز الدورة الدموية والصحة العامة.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: <Sparkles className="h-10 w-10 text-yellow-500" />,
    title: "لماذا رايت ووتر؟ لأننا لا نساوم على صحتك",
    image: "https://envs.sh/hEm.jpg",
    content: (
      <>
        <p className="mb-4">في سوق مليء بالخيارات، تبرز "رايت ووتر" لأننا نضع صحتك أولاً. نحن لا نبيع مجرد أجهزة، بل نقدم وعدًا بالجودة والنقاء. فلاترنا تستخدم مكونات عالية الجودة ومعتمدة لضمان أداء يدوم طويلاً، وفريقنا الفني مدرب لتقديم خدمة تركيب وصيانة لا تشوبها شائبة. اختيارك لنا يعني اختيار راحة البال والثقة في كل قطرة ماء.</p>
        <p className="font-semibold text-primary">استثمارك في فلتر من رايت ووتر هو استثمار مباشر في صحة وسعادة عائلتك.</p>
      </>
    ),
  },
  {
    icon: <ShoppingCart className="h-10 w-10 text-green-500" />,
    title: "لا تنتظر أكثر! اتخذ قرار الصحة اليوم",
    image: "https://envs.sh/hQE.jpg",
    content: (
      <>
        <p className="mb-4">كل يوم يمر دون وجود فلتر مياه نقي في منزلك هو يوم آخر تتعرض فيه أنت وعائلتك لمخاطر غير ضرورية. الأمر ليس مجرد شراء منتج، بل هو قرار واعٍ لحماية أغلى ما تملك: صحتكم. تصفح مجموعتنا الآن، قارن بين الموديلات، وإذا كان لديك أي سؤال، فريقنا جاهز لمساعدتك في اختيار الفلتر المثالي لمنزلك.</p>
        <p className="font-semibold text-green-600">لا تؤجل قرارًا يمكن أن يغير جودة حياتك. صحتك تستحق الأفضل، وصحتك تبدأ الآن!</p>
      </>
    ),
  },
  {
    icon: <Package className="h-10 w-10 text-blue-500" />,
    title: "الكتالوج الكامل لمنتجات فلاتر المياه وقطع الغيار",
    image: "https://images.unsplash.com/photo-1587019230139-2d25085c88d8?w=600&auto=format&fit=crop&q=60",
    content: <AllProductsAccordion />,
  },
];

const ArticleCard = ({ article, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
    >
        <Card className="flex flex-col h-full glassmorphism-card hover:shadow-2xl transition-shadow duration-300 w-full overflow-hidden">
            <div className="aspect-video overflow-hidden bg-muted">
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    loading="lazy"
                />
            </div>
            <CardHeader className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-background/50 rounded-full w-fit">
                      {article.icon}
                    </div>
                    <CardTitle className="text-xl md:text-2xl text-foreground">{article.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
                <div className="text-muted-foreground leading-relaxed">{article.content}</div>
            </CardContent>
        </Card>
    </motion.div>
);

const ArticlesPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          دليلك الكامل للمياه الصحية
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          المعرفة قوة، خاصة عندما يتعلق الأمر بصحتك. اقرأ مقالاتنا لتفهم لماذا المياه النقية هي أفضل قرار يمكنك اتخاذه اليوم.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {articles.map((article, index) => (
          <div key={index} className={index === articles.length - 1 ? 'lg:col-span-2' : ''}>
             <ArticleCard article={article} index={index} />
          </div>
        ))}
      </div>

       <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-20 text-center bg-gradient-to-r from-sky-500 to-green-500 text-white p-8 md:p-12 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">هل أنت جاهز للترقية إلى مياه أنقى؟</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          لقد قرأت الحقائق. الآن حان وقت العمل. استثمر في صحتك وصحة أحبائك اليوم.
        </p>
        <Link to="/products">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100 text-lg px-10 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
            <ShoppingCart className="ml-3 h-6 w-6" />
            تسوق أفضل الفلاتر الآن
          </Button>
        </Link>
      </motion.section>
    </div>
  );
};

export default ArticlesPage;
