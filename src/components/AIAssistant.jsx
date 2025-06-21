// src/components/AIAssistant.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2 } from 'lucide-react';
import AIFloatingButton from './AIFloatingButton';
import ChatBubble from './ChatBubble';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'مرحباً! أنا مساعدك الذكي في رايت ووتر. كيف يمكنني خدمتك اليوم؟' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // للتمرير لأسفل عند إضافة رسالة جديدة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    // --- (مؤقت) ردود ثابتة ---
    // في الخطوة القادمة، سنستبدل هذا بمنطق الذكاء الاصطناعي الحقيقي
    setTimeout(() => {
      let aiResponse = "عذراً، لم أفهم سؤالك. هل يمكنك توضيحه؟";
      if (userMessage.includes("سعر")) {
        aiResponse = "لمعرفة أسعار المنتجات، يرجى زيارة صفحة المنتجات الخاصة بنا. هل هناك منتج معين تسأل عنه؟";
      } else if (userMessage.includes("شحن") || userMessage.includes("توصيل")) {
        aiResponse = "مدة التوصيل تستغرق من 3 إلى 5 أيام عمل داخل مصر. تكلفة الشحن ثابتة وهي 50 جنيهًا مصريًا.";
      } else if (userMessage.includes("شكرا")) {
        aiResponse = "العفو! في خدمتك دائمًا.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <AIFloatingButton onClick={() => setIsOpen(true)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 z-[60] w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-background border border-border rounded-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">مساعد رايت ووتر الذكي</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-muted">
                <X size={20} />
              </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <ChatBubble key={index} sender={msg.sender} message={msg.text} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <footer className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !inputValue}>
                  <Send size={20} />
                </Button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
