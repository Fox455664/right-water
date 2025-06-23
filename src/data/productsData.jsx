// src/data/productsData.js

import React from 'react';
import { Layers, Droplets, Shield, Box, Wrench, Package, Filter, Zap, Faucet, Warehouse, Scissors, Ruler, Gauge, RadioTower, Thermometer, FlaskConical, CircleDot, CheckCircle, PackageSearch } from 'lucide-react';

export const productCategories = [
    {
      id: "sham3a-owla",
      title: "شمعات المرحلة الأولى (PP)",
      icon: <Layers size={28} className="text-primary"/>,
      products: [
        { name: "شمعة أولى 65 جرام", icon: <Layers size={20}/>, description: "خط الدفاع الأول. مصنوعة من ألياف البولي بروبلين بكثافة 65 جرام ومسامية 5 ميكرون، تزيل بكفاءة الشوائب الكبيرة مثل الصدأ، الرمال، والأتربة.", image: "https://images.unsplash.com/photo-1617953141905-65c8612311fd?w=500", altText: "شمعة فلتر المرحلة الأولى 65 جرام لإزالة الرواسب" },
        { name: "شمعة أولى 90 جرام", icon: <Layers size={20}/>, description: "كثافة أعلى لعمر افتراضي أطول وقدرة استيعابية أكبر للشوائب، مثالية للمناطق ذات المياه المحملة بالرواسب.", image: "https://images.unsplash.com/photo-1615174010339-c13681427116?w=500", altText: "شمعة فلتر المرحلة الأولى 90 جرام عالية الكثافة" },
        { name: "شمعة أولى 100 جرام رايت ووتر", icon: <CheckCircle size={20} className="text-green-500"/>, description: "شمعة رايت ووتر الأصلية، تضمن أفضل حماية لفلترك وأداء ثابت وموثوق به لإطالة عمر باقي الشمعات.", image: "https://images.unsplash.com/photo-1605005858998-e7f33d3c909e?w=500", altText: "شمعة فلتر أصلية من رايت ووتر 100 جرام" },
        { name: "شمعة أولى 110 جرام رايت ووتر", icon: <CheckCircle size={20} className="text-green-500"/>, description: "كفاءة فائقة وعمر افتراضي ممتد من رايت ووتر، مصممة لتحمل أصعب الظروف وتوفير حماية لا تضاهى.", image: "https://images.unsplash.com/photo-1599493356805-3cd47690f679?w=500", altText: "شمعة فلتر رايت ووتر 110 جرام" },
        { name: "شمعة أولى 125 جرام رايت ووتر", icon: <CheckCircle size={20} className="text-green-500"/>, description: "أعلى جودة في فئتها لحماية مطلقة، الخيار الأمثل لمن يبحث عن أفضل نقاء للمياه من أول مرحلة.", image: "https://images.unsplash.com/photo-1556740738-b6a63e2775d2?w=500", altText: "شمعة فلتر رايت ووتر 125 جرام فائقة الجودة" },
        { name: "شمعة أولى 135 جرام رايت ووتر", icon: <CheckCircle size={20} className="text-green-500"/>, description: "الشمعة الأكثر كثافة وقوة، مصممة خصيصًا للمناطق ذات المياه الصعبة والمليئة بالرواسب لضمان أقصى حماية.", image: "https://images.unsplash.com/photo-1617953141905-65c8612311fd?w=500", altText: "شمعة فلتر رايت ووتر 135 جرام للمياه الصعبة" },
        { name: "شمعة أولى 20 بوصه", icon: <Ruler size={20}/>, description: "للفلاتر المركزية والتجارية، بحجم 20 بوصة (Slim) لخدمة تدفقات المياه العالية بكفاءة.", image: "https://images.unsplash.com/photo-1623990088169-3eafccdec2c0?w=500", altText: "شمعة فلتر 20 بوصة للفلاتر المركزية" },
        { name: "شمعة أولى جامبو", icon: <Box size={20}/>, description: "للفلاتر المركزية الجامبو، بأعلى قدرة استيعابية لإزالة الرواسب من المصدر الرئيسي للمياه.", image: "https://images.unsplash.com/photo-1599493356805-3cd47690f679?w=500", altText: "شمعة فلتر جامبو للفلتر المركزي" },
        { name: "شمعة أولى كومبكت تركي", icon: <CircleDot size={20}/>, description: "شمعة مدمجة (Inline) صناعة تركية عالية الجودة، تستخدم كفلتر إضافي أو في بعض أنظمة الفلترة الخاصة.", image: "https://images.unsplash.com/photo-1605005858998-e7f33d3c909e?w=500", altText: "شمعة فلتر مدمجة كومبكت صناعة تركية" },
        { name: "شمعة أولى كومبكت صيني", icon: <CircleDot size={20}/>, description: "شمعة مدمجة (Inline) صناعة صينية بجودة ممتازة، بديل اقتصادي بنفس الكفاءة.", image: "https://images.unsplash.com/photo-1615174010339-c13681427116?w=500", altText: "شمعة فلتر مدمجة كومبكت صناعة صينية" },
      ],
    },
    {
      id: "sham3a-thania",
      title: "شمعات المرحلة الثانية (GAC)",
      icon: <Droplets size={28} className="text-primary"/>,
      products: [
        { name: "رايت ووتر كاب أخضر", icon: <CheckCircle size={20} className="text-green-500"/>, description: "مصنوعة من أجود أنواع الكربون النشط الحبيبي لامتصاص الكلور، الطعم، والرائحة من المياه بشكل فعال.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة كربون حبيبي GAC من رايت ووتر" },
        { name: "رايت ووتر كاب أزرق", icon: <CheckCircle size={20} className="text-green-500"/>, description: "إصدار عالي الجودة من شمعة رايت ووتر الثانية لضمان أقصى امتصاص للكلور.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة كربون حبيبي رايت ووتر كاب أزرق" },
        { name: "رايت ووتر مصري", icon: <CheckCircle size={20} className="text-green-500"/>, description: "إصدار صناعة مصرية عالية الجودة من شمعة الكربون الحبيبي لضمان تحسين طعم ورائحة المياه.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة كربون حبيبي صناعة مصرية" },
        { name: "فيتنامي", icon: <Droplets size={20}/>, description: "شمعة GAC فيتنامية المنشأ، معروفة بكفاءتها العالية في معالجة المياه وإزالة الكلور.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة كربون فيتنامية للمرحلة الثانية" },
        { name: "أكوافلتر", icon: <Droplets size={20}/>, description: "ماركة أوروبية رائدة، توفر أداءً استثنائيًا وموثوقية في تنقية المياه من الكلور.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة المرحلة الثانية من أكوافلتر" },
        { name: "أكواوين", icon: <Droplets size={20}/>, description: "شمعة كربونية عالية الأداء من علامة أكواوين العالمية.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة المرحلة الثانية من أكواوين" },
        { name: "كويك سيلفر", icon: <Droplets size={20}/>, description: "شمعة GAC من كويك سيلفر مصممة لامتصاص سريع وفعال للكلور والمواد الكيميائية.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة المرحلة الثانية كويك سيلفر" },
        { name: "مصري", icon: <Droplets size={20}/>, description: "خيار اقتصادي بجودة ممتازة، شمعة كربون حبيبي صناعة مصرية.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة المرحلة الثانية GAC صناعة مصرية" },
        { name: "تروبيكال", icon: <Droplets size={20}/>, description: "شمعة كربونية من تروبيكال مصممة خصيصًا لتحسين طعم المياه وإزالة أي روائح غير مرغوبة.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة كربون تروبيكال للمرحلة الثانية" },
        { name: "وينتر", icon: <Droplets size={20}/>, description: "شمعة GAC من وينتر تقدم أداءً موثوقًا وثابتًا طوال فترة عمرها الافتراضي.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة كربون وينتر للمرحلة الثانية" },
        { name: "توب ووتر", icon: <Droplets size={20}/>, description: "شمعة كربونية من توب ووتر، خيارك لنقاء عالي وتصفية ممتازة.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة كربون توب ووتر للمرحلة الثانية" },
        { name: "باور جيت", icon: <Droplets size={20}/>, description: "شمعة GAC من باور جيت مصممة لإزالة فعالة وقوية للكلور والملوثات العضوية.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة كربون باور جيت للمرحلة الثانية" },
        { name: "كومبكت تركي", icon: <CircleDot size={20}/>, description: "شمعة GAC مدمجة (Inline) صناعة تركية للاستخدامات الخاصة.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة كربون كومبكت تركي" },
        { name: "20 بوصه", icon: <Ruler size={20}/>, description: "شمعة GAC بحجم 20 بوصة (Slim) للفلتر المركزي وأنظمة التدفق العالي.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعة كربون 20 بوصة" },
        { name: "جامبو", icon: <Box size={20}/>, description: "شمعة GAC بحجم جامبو للفلتر المركزي لمعالجة كميات كبيرة من المياه.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة كربون جامبو" }
      ]
    },
    {
      id: "sham3a-thalitha",
      title: "شمعات المرحلة الثالثة (CTO) والمراحل العليا",
      icon: <Filter size={28} className="text-primary"/>,
      products: [
        { name: "شمعة ثالثة رايت ووتر (أخضر/أزرق/مصري)", icon: <CheckCircle size={20} className="text-green-500"/>, description: "شمعة كربون صلب (بلوك) من رايت ووتر لتأكيد إزالة الكلور وأدق الشوائب، وحماية غشاء الممبرين.", image: "https://images.unsplash.com/photo-1591039485093-e43599a03970?w=500", altText: "شمعة كربون صلب CTO من رايت ووتر" },
        { name: "شمعة ثالثة فيتنامي/أكوافلتر/أكواوين/كويك سيلفر", icon: <Shield size={20}/>, description: "مجموعة من الماركات العالمية الموثوقة لشمعات الكربون الصلب التي تضمن أقصى حماية للممبرين.", image: "https://images.unsplash.com/photo-1605721911519-58b38304245f?w=500", altText: "شمعات كربون صلب CTO من ماركات عالمية" },
        { name: "شمعة ثالثة بولي بكاب/تروبيكال", icon: <Shield size={20}/>, description: "خيارات إضافية من شمعات المرحلة الثالثة بتركيبات مختلفة لتناسب جميع أنواع الفلاتر.", image: "https://images.unsplash.com/photo-1589938883269-3110250d7549?w=500", altText: "شمعة كربون صلب CTO بولي بكاب" },
        { name: "بوست كربون (نيو جيت / استيفوا)", icon: <FlaskConical size={20}/>, description: "شمعة المرحلة الخامسة (Post Carbon) مصممة لإزالة أي طعم أو رائحة مكتسبة من الخزان وتحسين الطعم النهائي للمياه.", image: "https://images.unsplash.com/photo-1574974641320-3052d43e9e31?w=500", altText: "شمعة بوست كربون المرحلة الخامسة" },
        { name: "كالسيت (نيو جيت / استيفوا / تركي / فيتنامي / صيني / مصري)", icon: <Thermometer size={20}/>, description: "شمعة المرحلة السادسة الحيوية، تعيد إضافة المعادن المفيدة والأملاح الأساسية مثل الكالسيوم والمغنيسيوم لرفع قلوية الماء.", image: "https://images.unsplash.com/photo-1619178490333-abd4036b1a37?w=500", altText: "شمعة كالسيت المرحلة السادسة" },
        { name: "إنفراريد (نيو جيت / استيفوا / فيتنامي / صيني / مصري)", icon: <RadioTower size={20}/>, description: "شمعة الأشعة تحت الحمراء، تعمل على تنشيط جزيئات الماء وزيادة نسبة الأكسجين المذاب لتحسين الدورة الدموية.", image: "https://images.unsplash.com/photo-1574974641320-3052d43e9e31?w=500", altText: "شمعة إنفراريد المرحلة السابعة" },
      ]
    },
    {
      id: "taqm-hawzeng",
      title: "هياكل الفلاتر (هاوزنج)",
      icon: <Warehouse size={28} className="text-primary"/>,
      products: [
        { name: "طقم هاوزنج فيتنامي CCK", icon: <Package size={20}/>, description: "طقم هاوزنج كامل (3 قطع) فيتنامي أصلي من CCK، مصمم لمنع التسريب ومقاومة الضغط العالي.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج فيتنامي CCK" },
        { name: "طقم هاوزنج سوان إيكوا", icon: <Package size={20}/>, description: "طقم هاوزنج عالي الجودة من سوان إيكوا، مصنوع من مواد صحية وآمنة 100%.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج سوان إيكوا" },
        { name: "طقم هاوزنج جاكوار (أبيض/شفاف)", icon: <Package size={20}/>, description: "طقم هاوزنج من جاكوار، متوفر باللون الأبيض الأنيق أو الشفاف لمراقبة الشمعة الأولى.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "طقم هاوزنج جاكوار" },
        { name: "هاوزنج غسالة جاكوار", icon: <Filter size={20}/>, description: "هاوزنج مخصص لتركيبه قبل الغسالة لحماية أجزائها الداخلية من الرواسب والصدأ.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج فلتر غسالة" },
        { name: "هاوزنج فيتنامي CCK (أبيض/شفاف)", icon: <Box size={20}/>, description: "قطع هاوزنج فردية فيتنامية عالية الجودة لمن يحتاج لتغيير قطعة واحدة فقط.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج فيتنامي فردي" },
        { name: "هاوزنج سوان إيكوا (أبيض/شفاف)", icon: <Box size={20}/>, description: "قطع هاوزنج فردية من سوان إيكوا، متانة وجودة مضمونة.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج سوان إيكوا فردي" },
        { name: "هاوزنج جامبو / 20 بوصة (فيتنامي/صيني)", icon: <Ruler size={20}/>, description: "هاوزنجات للأحجام الكبيرة والفلاتر المركزية، مصممة لتحمل تدفقات المياه العالية.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج جامبو و 20 بوصة" },
      ]
    },
    {
      id: "shasie-plastic",
      title: "شاسيهات وقواعد الفلاتر",
      icon: <PackageSearch size={28} className="text-primary"/>,
      products: [
        { name: "شاسيه بلاستيك أسود", icon: <Box size={20}/>, description: "قاعدة بلاستيكية سوداء أساسية لتجميع مكونات الفلتر بشكل منظم.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه فلتر بلاستيك أسود" },
        { name: "شاسيه بلاستيك RO رايت ووتر (أبيض/أزرق/برتقالي)", icon: <CheckCircle size={20} className="text-green-500"/>, description: "شاسيهات RO من رايت ووتر، مصنوعة من البلاستيك المقوى المقاوم للصدأ بألوان متعددة.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه RO بلاستيك من رايت ووتر" },
        { name: "شاسيه بوكس", icon: <Package size={20}/>, description: "تصميم عصري مغلق بالكامل (كابينة) لحماية مكونات الفلتر من الأتربة وإعطاء مظهر جمالي.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه فلتر بوكس" },
        { name: "شاسيه خماسي معدن", icon: <Shield size={20}/>, description: "قاعدة معدنية قوية ومدهونة إلكتروستاتيك لمقاومة الصدأ، مصممة للفلتر الخماسي.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه معدني لفلتر خماسي" },
        { name: "شاسيه RO (أبيض/أزرق/برتقالي/أسود)", icon: <Box size={20}/>, description: "قواعد فلاتر RO متوفرة بجميع الألوان لتتناسب مع تصميم جهازك.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500", altText: "شاسيه فلتر RO بعدة ألوان" },
        { name: "شاسيه خماسي (أبيض/أسود)", icon: <Box size={20}/>, description: "قواعد فلاتر خماسية باللونين الأبيض والأسود الكلاسيكيين.", image: "https://images.unsplash.com/photo-1541701494587-b959cc34e7d1?w=500", altText: "شاسيه فلتر خماسي" },
      ]
    },
    {
      id: "ro-membranes-and-parts",
      title: "أغشية RO ومضخات وخزانات",
      icon: <Zap size={28} className="text-primary"/>,
      products: [
        { name: "ممبرين LG / بنتير / فلمنيك", icon: <Gauge size={20}/>, description: "قلب نظام الفلترة، متوفر من أفضل الماركات العالمية (كوري وأمريكي) لضمان أعلى نسبة إزالة للأملاح.", image: "https://images.unsplash.com/photo-1629196168535-30f146e273a2?w=500", altText: "غشاء ممبرين RO عالي الجودة" },
        { name: "ممبرين فيتنامي / لوف / ووتر تك / كويك سيلفر", icon: <Gauge size={20}/>, description: "مجموعة متنوعة من أغشية التناضح العكسي عالية الكفاءة لتناسب مختلف الاحتياجات والميزانيات.", image: "https://images.unsplash.com/photo-1629196168535-30f146e273a2?w=500", altText: "ممبرين RO فيتنامي" },
        { name: "مضخة (صيني/هندي كروز/هندي هاي ليف/هيدون)", icon: <Zap size={20}/>, description: "مضخات قوية وصامتة لرفع ضغط المياه لضمان أفضل أداء للممبرين، خاصة في الأدوار العليا.", image: "https://images.unsplash.com/photo-1631124849761-365751993466?w=500", altText: "مضخة فلتر مياه" },
        { name: "ترانس (إلكتروني/مختوم/رايت ووتر)", icon: <Zap size={20}/>, description: "محولات كهربائية آمنة ومعزولة لتشغيل المضخة بكفاءة واستقرار.", image: "https://images.unsplash.com/photo-1631124849761-365751993466?w=500", altText: "ترانسفورمر فلتر مياه" },
        { name: "خزان (صيني/فيتنامي) - جالون، 3.2، 5 جالون", icon: <Warehouse size={20}/>, description: "خزانات تخزين المياه النقية، مبطنة بطبقة صحية لمنع تفاعل الماء مع المعدن.", image: "https://images.unsplash.com/photo-1557683316-9694a869784f?w=500", altText: "خزان فلتر مياه" },
        { name: "هاي و لو و رباعي (تايواني/صيني/مختوم)", icon: <Gauge size={20}/>, description: "مفاتيح التحكم في الضغط (High & Low Pressure Switch) لتشغيل وفصل المضخة أوتوماتيكيًا.", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500", altText: "مفتاح ضغط هاي ولو للفلتر" },
        { name: "هيد مضخة قلب معدن / طقم إصلاح", icon: <Wrench size={20}/>, description: "رؤوس مضخات بديلة عالية الجودة وأطقم إصلاح لإعادة المضخة لحالتها الأصلية.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "هيد مضخة وطقم إصلاح" },
      ]
    },
    {
      id: "hanfiat",
      title: "حنفيات، محابس، ووصلات",
      icon: <Faucet size={28} className="text-primary"/>,
      products: [
        { name: "حنفية ثلاثي", icon: <Faucet size={20}/>, description: "حنفية أساسية وعملية للاستخدام اليومي.", image: "https://images.unsplash.com/photo-1599837563398-0584b4e3e316?w=500", altText: "حنفية فلتر مياه ثلاثية" },
        { name: "حنفية لوكس (مذهبة/فضي)", icon: <Faucet size={20}/>, description: "حنفية فاخرة بقلب نحاس وتصميم أنيق (ذهبي أو فضي) لإضافة لمسة جمالية لمطبخك.", image: "https://images.unsplash.com/photo-1599837563398-0584b4e3e316?w=500", altText: "حنفية فلتر لوكس" },
        { name: "حنفية هاند مكسر (قلب بلاستيك/قلب نحاس)", icon: <Faucet size={20}/>, description: "حنفية بتصميم عصري ومقبض يدوي مريح، متوفرة بقلب بلاستيك أو نحاس لمتانة أعلى.", image: "https://images.unsplash.com/photo-1599837563398-0584b4e3e316?w=500", altText: "حنفية فلتر هاند ميكسر" },
        { name: "محبس (دخول بلاستيك/دخول معدن/مباشر/خزان)", icon: <Scissors size={20}/>, description: "جميع أنواع المحابس للتحكم في مسار المياه، سواء محبس الدخول الرئيسي أو محبس الخزان.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "محابس فلاتر المياه" },
        { name: "كوع (ربع/مضخة/ممبرين/شيك بلف/ثلاثي تيل)", icon: <Wrench size={20}/>, description: "مجموعة كاملة من الأكواع والوصلات سريعة التركيب (Easy Fitting) أو بالصامولة لتناسب جميع احتياجات التركيب.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "وصلات وأكواع فلاتر المياه" },
        { name: "صباع صرف (صيني/تايواني)", icon: <Wrench size={20}/>, description: "وصلة تركيب خرطوم الصرف على حوض المطبخ بشكل آمن ومنظم.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "وصلة صباع صرف للفلتر" },
        { name: "نترة (بلاستيك/بمحبس/معدن/ألمنيوم)", icon: <Wrench size={20}/>, description: "وصلات دخول المياه (T-Adapter) بأحجام مختلفة للتركيب على خط المياه الرئيسي.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "وصلة نترة لدخول المياه" },
      ]
    },
    {
      id: "adwat-izafia",
      title: "ملحقات وأدوات إضافية",
      icon: <Wrench size={28} className="text-primary"/>,
      products: [
        { name: "فلتر انجليزي صيني / شمعة انجليزي صيني", icon: <Filter size={20}/>, description: "فلتر سيراميك مرحلة واحدة بتصميم إنجليزي، فعال لإزالة الشوائب والبكتيريا.", image: "https://images.unsplash.com/photo-1599837563398-0584b4e3e316?w=500", altText: "فلتر انجليزي سيراميك" },
        { name: "شمعة باناسونيك", icon: <Filter size={20}/>, description: "شمعة بديلة عالية الجودة مخصصة لفلاتر باناسونيك الأصلية.", image: "https://images.unsplash.com/photo-1581338873211-5714acdb459b?w=500", altText: "شمعة فلتر باناسونيك" },
        { name: "مفتاح هاوزنج (عادي/رايت/جامبو)", icon: <Wrench size={20}/>, description: "أداة لا غنى عنها لفك وربط الهاوزنج بسهولة وأمان عند تغيير الشمعات.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "مفتاح هاوزنج" },
        { name: "جوان (هاوزنج/كابات)", icon: <CircleDot size={20}/>, description: "قطع غيار (O-rings) لمنع التسريب من الهاوزنج وكابات الأجهزة.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "جوان O-ring للفلتر" },
        { name: "طبق ثلاثي", icon: <Layers size={20}/>, description: "قطعة بلاستيكية لربط الثلاث شمعات الرأسية الأولى معًا بشكل منظم.", image: "https://images.unsplash.com/photo-1621995837588-0043aa42137a?w=500", altText: "طبق ثلاثي لتثبيت الشمعات" },
        { name: "هاوزنج ممبرين (صيني/تركي/فيتنامي)", icon: <Box size={20}/>, description: "الهيكل الخارجي الذي يتم وضع غشاء الممبرين بداخله.", image: "https://images.unsplash.com/photo-1616444855752-c0e8b7c7e8e7?w=500", altText: "هاوزنج ممبرين" },
        { name: "لفة خرطوم (100 متر/300 متر)", icon: <Ruler size={20}/>, description: "لفات خراطيم عالية الجودة للتركيبات والتوصيلات الطويلة.", image: "https://images.unsplash.com/photo-1557683316-9694a869784f?w=500", altText: "لفة خرطوم فلتر مياه" },
        { name: "قارورة توصيل مباشر (مصري/صيني/فيتنامي)", icon: <Droplets size={20}/>, description: "بديل القارورة التقليدية، للتوصيل المباشر من الفلتر إلى مبردات المياه (الكولدير).", image: "https://images.unsplash.com/photo-1581338873211-5714acdb459b?w=500", altText: "قارورة توصيل مباشر للفلتر" },
      ]
    },
    {
      id: "karton",
      title: "كرتون وعبوات تغليف",
      icon: <Package size={28} className="text-primary"/>,
      products: [
        { name: "كرتونة ثلاثي (رايت/خشبي)", icon: <Box size={20}/>, description: "كرتون مخصص لتغليف الفلتر الثلاثي بشكل آمن وأنيق.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف فلتر ثلاثي" },
        { name: "كرتونة خماسي (أزرق/خشبي/رايت/بريمو/جاكوار)", icon: <Box size={20}/>, description: "كرتون مصمم خصيصًا لتغليف الفلتر الخماسي بمختلف العلامات التجارية.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف فلتر خماسي" },
        { name: "كرتونة خماسي ووتر لايف (لبني/عادي)", icon: <Box size={20}/>, description: "كرتون مخصص لفلتر ووتر لايف بتصميماته المختلفة.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف فلتر ووتر لايف" },
        { name: "كرتونة RO/فلترة (أزرق/أخضر)", icon: <Box size={20}/>, description: "كرتون عام عالي الجودة لتغليف أنظمة التناضح العكسي والفلاتر.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف فلتر RO" },
        { name: "كرتونة طقم/عبوة شمع/هاوزنج غسالة", icon: <Box size={20}/>, description: "كرتون مخصص لتغليف أطقم الشمعات وقطع الغيار بشكل احترافي.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف قطع غيار" },
        { name: "كرتونة بوكس (ووتر بوكس/ساده/ساده 5 راق)", icon: <Box size={20}/>, description: "كرتون مخصص للفلاتر ذات التصميم المغلق (البوكس) بأعلى جودة لحماية الجهاز.", image: "https://images.unsplash.com/photo-1596521744122-54a7e24c2a71?w=500", altText: "كرتونة تغليف فلتر بوكس" },
      ]
    },
];
