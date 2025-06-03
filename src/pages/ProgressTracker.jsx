import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, Camera, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useGame } from '../contexts/GameContext';

const ProgressTracker = () => {
  const { analytics } = useWorkout();
  const { level, achievements } = useGame();
  const [selectedMetric, setSelectedMetric] = useState('strength');
  const [timeRange, setTimeRange] = useState('3m');

  const metrics = [
    { id: 'strength', label: 'Strength', color: 'from-red-500 to-orange-500' },
    { id: 'volume', label: 'Volume', color: 'from-purple-500 to-pink-500' },
    { id: 'frequency', label: 'Frequency', color: 'from-blue-500 to-cyan-500' }
  ];

  // Mock progress photos
  const progressPhotos = [
    { id: 1, date: '2025-01-01', url: '/api/placeholder/200/250', label: 'Front' },
    { id: 2, date: '2025-02-01', url: '/api/placeholder/200/250', label: 'Side' },
    { id: 3, date: '2025-03-01', url: '/api/placeholder/200/250', label: 'Back' }
  ];

  // Mock measurements
  const measurements = [
    { date: '2025-01-01', chest: 40, arms: 14, waist: 32, thighs: 24 },
    { date: '2025-02-01', chest: 40.5, arms: 14.2, waist: 31.5, thighs: 24.2 },
    { date: '2025-03-01', chest: 41, arms: 14.5, waist: 31, thighs: 24.5 },
    { date: '2025-04-01', chest: 41.5, arms: 14.8, waist: 30.5, thighs: 25 }
  ];

  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Progress Tracker</h1>
          <p className="text-gray-400">Track your transformation journey</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Days Active', value: '89', change: '+12', icon: Calendar },
            { label: 'Total Workouts', value: analytics?.totalWorkouts || '0', change: '+8', icon: TrendingUp },
            { label: 'Achievements', value: achievements.length, change: '+3', icon: Award },
            { label: 'Current Level', value: level, change: '+2', icon: Target }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-8 h-8 text-purple-400" />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Performance Trends</h2>
              <div className="flex space-x-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedMetric === metric.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics?.volumeOverTime?.slice(-12) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#8b5cf6" 
                  fill="url(#progressGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Body Measurements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-6">Body Measurements</h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Line type="monotone" dataKey="chest" stroke="#8b5cf6" strokeWidth={2} name="Chest" />
                <Line type="monotone" dataKey="arms" stroke="#06b6d4" strokeWidth={2} name="Arms" />
                <Line type="monotone" dataKey="waist" stroke="#10b981" strokeWidth={2} name="Waist" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Progress Photos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Progress Photos</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photo
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progressPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative group"
              >
                <div className="aspect-[3/4] bg-slate-700 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 rounded-b-lg">
                  <p className="text-white text-sm font-medium">{photo.label}</p>
                  <p className="text-gray-300 text-xs">{photo.date}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Add Photo Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="aspect-[3/4] border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center hover:border-purple-500 transition-all cursor-pointer group"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                <p className="text-gray-400 group-hover:text-purple-400 text-sm transition-colors">Add Photo</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Milestones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(-6).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <p className="text-white font-medium">{achievement.title}</p>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressTracker;