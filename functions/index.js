// functions/index.js (النسخة النهائية الكاملة)

const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// استيراد وتجهيز مكتبة cors للسماح بالطلبات
// origin: true تعني أنه سيسمح تلقائياً لأي موقع يرسل الطلب، وهو الأفضل للتعامل مع preflight requests
const cors = require('cors')({ origin: true });

// تهيئة النموذج - تأكد من أن مفتاح API الخاص بك تم إعداده بشكل صحيح
// في Firebase Functions config باستخدام الأمر:
// firebase functions:config:set gemini.key="YOUR_API_KEY"
let genAI;
try {
  // هذا السطر يحاول قراءة مفتاح API من إعدادات Firebase
  genAI = new GoogleGenerativeAI(functions.config().gemini.key);
} catch (error) {
  // إذا فشلت القراءة، سيتم طباعة هذا الخطأ في سجلات Firebase
  console.error("CRITICAL: Failed to initialize GoogleGenerativeAI. Make sure 'gemini.key' is set in Firebase config.", error);
}

// تهيئة الموديل. إذا فشلت الخطوة السابقة، سيكون 'model' فارغاً (null)
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

// تصدير الدالة الرئيسية askGemini
exports.askGemini = functions.https.onRequest((req, res) => {
  
  // 1. تشغيل cors أولاً. هذه الدالة ستتعامل تلقائياً مع طلبات OPTIONS
  // وستضيف الهيدرز الصحيحة مثل 'Access-Control-Allow-Origin'
  cors(req, res, async () => {
    
    // 2. التحقق إذا كان الموديل قد فشل في التهيئة
    if (!model) {
        console.error("Gemini model is not initialized. Cannot process request.");
        res.status(500).send({ error: "فشل تهيئة المساعد الذكي. يرجى مراجعة إعدادات السيرفر." });
        return;
    }
      
    // 3. نحن نتوقع فقط طلبات من نوع POST
    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method Not Allowed. Please use POST.' });
      return;
    }

    // 4. قراءة السؤال من جسم الطلب
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      res.status(400).send({ error: 'The function must be called with a "prompt" argument in the request body.' });
      return;
    }

    // 5. التعليمات الأساسية للمساعد الذكي (System Prompt)
    const systemPrompt = `
      أنت مساعد ذكي لمتجر اسمه "رايت ووتر" متخصص في فلاتر المياه وأنظمة التحلية في مصر.
      مهمتك هي مساعدة العملاء والإجابة على استفساراتهم بلطف واحترافية وباللغة العربية (اللهجة المصرية).
      
      معلومات أساسية عن الشركة:
      - اسم الشركة: رايت ووتر (Right Water).
      - المنتجات: فلاتر مياه منزلية (3 مراحل، 5 مراحل، 7 مراحل)، محطات تحلية صغيرة، أنظمة معالجة صناعية.
      - الأسعار: تبدأ من 1000 جنيه مصري وتصل إلى 50,000 جنيه للأنظمة الكبيرة.
      - الشحن والتوصيل: داخل مصر فقط، يستغرق من 3 إلى 5 أيام عمل، تكلفة الشحن ثابتة 50 جنيه.
      - الدفع: الدفع عند الاستلام متاح.
      - الدعم الفني: متاح عبر الهاتف 0123456789 أو البريد الإلكتروني support@rightwater.com.eg
      - ساعات العمل: من الأحد إلى الخميس، من 9 صباحًا حتى 5 مساءً.
      
      قواعد الرد:
      1. كن ودودًا ومساعدًا دائمًا.
      2. استخدم اللغة العربية واللهجة المصرية البسيطة.
      3. إذا لم تعرف إجابة سؤال، قل "ليس لدي معلومات كافية عن هذا الأمر، ولكن يمكنك التواصل مع الدعم الفني لمساعدتك بشكل أفضل".
      4. لا تبتكر معلومات غير موجودة.
      5. حافظ على الردود قصيرة ومباشرة.
    `;

    try {
      // 6. بدء محادثة جديدة مع تاريخ التعليمات
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "فهمت. أنا مساعد رايت ووتر الذكي، جاهز لخدمة العملاء." }] },
        ],
      });

      // 7. إرسال سؤال المستخدم إلى Gemini
      const result = await chat.sendMessage(userPrompt);
      const response = result.response;
      const text = response.text();
      
      // 8. إرسال الرد بنجاح إلى العميل
      res.status(200).send({ text: text });

    } catch (error) {
      // 9. في حالة حدوث أي خطأ من Gemini، يتم تسجيله وإرسال رسالة خطأ عامة
      console.error("Gemini API Error:", error);
      res.status(500).send({ error: 'حدث خطأ أثناء التواصل مع المساعد الذكي.' });
    }
  });
});
