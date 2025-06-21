// src/components/ChatBubble.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const ChatBubble = ({ message, sender }) => {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center flex-shrink-0">
          <Bot size={24} />
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-md p-4 rounded-xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        }`}
      >
        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
      </div>
      
      {isUser && (
         <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
          <User size={24} />
        </div>
      )}
    </motion.div>
  );
};

export default ChatBubble;
