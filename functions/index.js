// functions/index.js

const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// تهيئة النموذج باستخدام مفتاح الـ API المحفوظ بأمان
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.askGemini = functions.https.onCall(async (data, context) => {
  // التأكد من أن المستخدم مسجل دخوله (اختياري لكنه جيد للأمان)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }
  
  const userPrompt = data.prompt;
  if (!userPrompt) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
  }

  // 🔥🔥 هنا نقوم بتدريب النموذج على معلومات شركتك (System Prompt) 🔥🔥
  // عدّل هذه المعلومات بمعلومات شركتك الحقيقية
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
          parts: [{ text: systemPrompt }], // يبدأ المستخدم بالتعليمات
        },
        {
          role: "model",
          parts: [{ text: "فهمت. أنا مساعد رايت ووتر الذكي، جاهز لخدمة العملاء." }], // رد النموذج للتأكيد
        },
      ],
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    const text = response.text();
    
    return { text: text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new functions.https.HttpsError('internal', 'حدث خطأ أثناء التواصل مع المساعد الذكي.');
  }
});
