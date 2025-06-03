import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp, Activity } from 'lucide-react';

const LoadingSpinner = ({ message, fullScreen = true, size = 'large' }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    { text: "Initializing AI neural networks...", icon: Brain },
    { text: "Processing workout data...", icon: Activity },
    { text: "Calculating muscle fiber activation...", icon: Zap },
    { text: "Analyzing progression patterns...", icon: TrendingUp },
    { text: "Optimizing performance metrics...", icon: Target },
    { text: "Generating insights...", icon: Brain },
  ];

  // Cycle through messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 3;
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const sizeClasses = {
    small: { spinner: 'w-8 h-8', text: 'text-sm', container: 'p-4' },
    medium: { spinner: 'w-12 h-12', text: 'text-base', container: 'p-6' },
    large: { spinner: 'w-16 h-16', text: 'text-lg', container: 'p-8' }
  };

  const currentSize = sizeClasses[size];

  const SpinnerContent = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center space-y-6 ${currentSize.container}`}
    >
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${currentSize.spinner} border-4 border-purple-500/20 border-t-purple-500 rounded-full`}
        />
        
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-2 border-2 border-pink-500/20 border-b-pink-500 rounded-full`}
        />
        
        {/* Center icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            times: [0, 0.5, 1]
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Brain className="w-6 h-6 text-purple-400" />
        </motion.div>
        
        {/* Pulse effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 ${currentSize.spinner} bg-purple-500/20 rounded-full`}
        />
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center space-x-3"
          >
            {React.createElement(loadingMessages[currentMessage].icon, {
              className: "w-5 h-5 text-purple-400"
            })}
            <span className={`text-white font-medium ${currentSize.text}`}>
              {message || loadingMessages[currentMessage].text}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-gray-400 max-w-md mx-auto"
        >
          💡 <span className="text-purple-400">Did you know?</span> AI can predict your strength gains 
          with 94% accuracy by analyzing your workout patterns!
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/60 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center">
        <SpinnerContent />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, purple 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, pink 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <SpinnerContent />

      {/* Corner Decorations */}
      <div className="absolute top-10 left-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-3 h-3 border border-purple-500/30 rounded"
        />
      </div>
      <div className="absolute top-10 right-10">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border border-pink-500/30 rounded-full"
        />
      </div>
      <div className="absolute bottom-10 left-10">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-2 h-2 bg-blue-500/40 rounded-full"
        />
      </div>
      <div className="absolute bottom-10 right-10">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-3 h-3 bg-gradient-to-br from-purple-500/40 to-pink-500/40 transform rotate-45"
        />
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;