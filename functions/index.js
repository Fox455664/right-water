// functions/index.js (النسخة النهائية 100% - تم إصلاح آخر خطأين)

const functions = require("firebase-functions");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const cors = require("cors")({origin: true});

let genAI;
try {
  genAI = new GoogleGenerativeAI(functions.config().gemini.key);
} catch (error) {
  console.error(
      "CRITICAL: Failed to initialize GoogleGenerativeAI.",
      error,
  );
}

const model = genAI ? genAI.getGenerativeModel({model: "gemini-1.5-flash"}) : null;

exports.askGemini = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!model) {
      console.error("Gemini model is not initialized. Cannot process request.");
      res.status(500).send({
        error: "فشل تهيئة المساعد الذكي. يرجى مراجعة إعدادات السيرفر.",
      });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send({error: "Method Not Allowed. Please use POST."});
      return;
    }

    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      res.status(400).send({
        error: "The function must be called with a 'prompt' argument.",
      });
      return;
    }

    const promptLines = [
      "أنت مساعد ذكي لمتجر اسمه \"رايت ووتر\" متخصص في فلاتر المياه",
      "وأنظمة التحلية في مصر. مهمتك هي مساعدة العملاء والإجابة على",
      "استفساراتهم بلطف واحترافية وباللغة العربية (اللهجة المصرية).",
      "معلومات أساسية عن الشركة:",
      "- اسم الشركة: رايت ووتر (Right Water).",
      // --- تم تقسيم هذا السطر الطويل إلى سطرين ---
      "- المنتجات: فلاتر مياه منزلية (3، 5، 7 مراحل)، محطات تحلية",
      "صغيرة، وأنظمة معالجة صناعية.",
      "- الأسعار: تبدأ من 1000 جنيه مصري وتصل إلى 50,000 جنيه",
      "للأنظمة الكبيرة.",
      "- الشحن والتوصيل: داخل مصر فقط، يستغرق من 3 إلى 5 أيام عمل،",
      "تكلفة الشحن ثابتة 50 جنيه.",
      "- الدفع: الدفع عند الاستلام متاح.",
      "- الدعم الفني: متاح عبر الهاتف 01117767717 أو البريد الإلكتروني",
      "rightwater156@gmail.com",
      "- ساعات العمل: من الأحد إلى السبت معاده يوم الجمعه اجازه، من 9 صباحًا حتى 5 مساءً.",
      "قواعد الرد:",
      "1. كن ودودًا ومساعدًا دائمًا.",
      "2. استخدم اللغة العربية واللهجة المصرية البسيطة.",
      "3. إذا لم تعرف إجابة سؤال، قل \"ليس لدي معلومات كافية عن",
      "هذا الأمر، ولكن يمكنك التواصل مع الدعم الفني لمساعدتك بشكل أفضل\".",
      "4. لا تبتكر معلومات غير موجودة.",
      "5. حافظ على الردود قصيرة ومباشرة.",
    ];
    const systemPrompt = promptLines.join(" ");

    try {
      const chat = model.startChat({
        history: [
          {role: "user", parts: [{text: systemPrompt}]},
          {
            role: "model",
            parts: [{text: "فهمت. أنا مساعد رايت ووتر الذكي."}],
          },
        ],
      });

      const result = await chat.sendMessage(userPrompt);
      const response = result.response;
      const text = response.text();

      res.status(200).send({text: text});
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).send({error: "حدث خطأ أثناء التواصل مع المساعد."});
    }
  });
});
