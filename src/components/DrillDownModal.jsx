import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, BarChart2, TrendingUp, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DrillDownModal = ({ isOpen, onClose, content }) => {
  if (!isOpen || !content) return null;

  const sectionIcons = {
    'What it means': <HelpCircle className="w-5 h-5 text-purple-400" />,
    'How it was calculated': <Cpu className="w-5 h-5 text-blue-400" />,
    'Your Key Data': <BarChart2 className="w-5 h-5 text-green-400" />,
    'AI Recommendations': <TrendingUp className="w-5 h-5 text-yellow-400" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {content.icon && React.createElement(content.icon, { className: "w-8 h-8 text-purple-400" })}
                <h2 className="text-2xl font-bold text-white">{content.title}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    {section.subtitle && (sectionIcons[section.subtitle] || <HelpCircle className="w-5 h-5 text-purple-400" />)}
                    <span className="ml-2">{section.subtitle}</span>
                  </h3>
                  
                  {section.text && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{section.text}</p>}
                  
                  {section.chartData && (
                    <div className="h-48 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={section.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                          <YAxis stroke="#9ca3af" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#ffffff'
                            }} 
                          />
                          {section.chartKey === 'e1rm' ? (
                            <Line type="monotone" dataKey="e1rm" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="E1RM" />
                          ) : section.chartKey === 'maxWeight' ? (
                            <Line type="monotone" dataKey="maxWeight" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Max Weight" />
                          ) : (
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {section.component && <div className="mt-2">{section.component}</div>}

                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrillDownModal;