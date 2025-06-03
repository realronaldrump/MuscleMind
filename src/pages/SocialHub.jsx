import React from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Heart, MessageCircle, Trophy } from 'lucide-react';

const SocialHub = () => {
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
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center"
          >
            <Users className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4"
          >
            Social Hub
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-300 mb-8"
          >
            Connect with the Fitness Community
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Coming Soon</span>
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">Social Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                { icon: Share2, text: 'Share workout achievements' },
                { icon: Trophy, text: 'Community challenges' },
                { icon: MessageCircle, text: 'Fitness discussions' },
                { icon: Users, text: 'Find workout buddies' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <feature.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">{feature.text}</span>
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
            Build connections, share progress, and motivate each other!
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialHub;