import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, Sparkles } from 'lucide-react';

const AICoach = () => {
  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center"
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            AI Coach
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-300 mb-8"
          >
            Your Personal AI Training Assistant
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Coming Soon</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">What's Coming:</h3>
            <div className="space-y-3 text-left">
              {[
                'Real-time form analysis and corrections',
                'Personalized workout recommendations',
                'Nutrition guidance based on your goals',
                'Recovery optimization suggestions',
                'Progressive overload planning',
                'Injury prevention alerts'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-gray-500 mt-8"
          >
            Stay tuned for the most advanced AI coaching experience in fitness!
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default AICoach;