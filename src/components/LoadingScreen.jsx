// src/components/LoadingScreen.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(false);

  // تأثير لزيادة شريط التحميل بشكل تدريجي
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          // بعد اكتمال التحميل، نعرض تأثير الطرطشة
          setTimeout(() => setShowSplash(true), 100);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200); // كل 200 مللي ثانية

    return () => clearInterval(timer);
  }, []);

  const text = "Right Water";
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const splashVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [1, 1.5, 1.2, 2, 0], 
      opacity: [1, 0.8, 0.6, 0.2, 0],
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
        <AnimatePresence>
            {!showSplash ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center"
                >
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center mb-6"
                    >
                        {text.split("").map((char, index) => (
                            <motion.span
                                key={`${char}-${index}`}
                                variants={letterVariants}
                                className={`text-4xl md:text-5xl font-bold text-primary ${char === ' ' ? 'mx-2' : ''}`}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>

                    <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="splash"
                    variants={splashVariants}
                    initial="initial"
                    animate="animate"
                >
                    <Droplets size={150} className="text-primary" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default LoadingScreen;
