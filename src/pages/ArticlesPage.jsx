// src/pages/ArticlesPage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, ShieldOff, HeartPulse, Sparkles, ShoppingCart, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  }
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
          <ArticleCard key={index} article={article} index={index} />
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
            تصفح منتجاتنا
          </Button>
        </Link>
      </motion.section>

    </div>
  );
};

export default ArticlesPage;
