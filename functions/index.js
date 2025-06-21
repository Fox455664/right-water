// functions/index.js

const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')({ origin: "https://right-water.vercel.app" }); // <-- 1. استدعاء مكتبة cors بالسماح لموقعك فقط

const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. تغيير الدالة من onCall إلى onRequest
exports.askGemini = functions.https.onRequest(async (req, res) => {
  // 3. تطبيق الـ cors على الدالة
  cors(req, res, async () => {
    // التعامل مع طلب OPTIONS الخاص بالـ preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // 4. قراءة الـ prompt من الـ request body
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      res.status(400).send({ error: 'The function must be called with a "prompt" argument.' });
      return;
    }

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
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "فهمت. أنا مساعد رايت ووتر الذكي، جاهز لخدمة العملاء." }],
          },
        ],
      });

      const result = await chat.sendMessage(userPrompt);
      const response = result.response;
      const text = response.text();
      
      // 5. إرسال الرد باستخدام res.send بدلاً من return
      res.status(200).send({ text: text });

    } catch (error) {
      console.error("Gemini API Error:", error);
      // 6. إرسال الخطأ باستخدام res.status
      res.status(500).send({ error: 'حدث خطأ أثناء التواصل مع المساعد الذكي.' });
    }
  });
});
