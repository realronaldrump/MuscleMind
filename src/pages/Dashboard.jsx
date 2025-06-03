import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Activity, Target, TrendingUp, Zap, Award, Brain, 
  Flame, BarChart3, Calendar, Clock, Users, Star, Play,
  ChevronRight, Bell, Settings, Download, Share2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
         Radar, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { rawData, analytics, predictions, loading, actions } = useWorkout();
  const { level, xp, achievements, actions: gameActions } = useGame();
  const { theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [timeRange, setTimeRange] = useState('30d');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (rawData.length === 0) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [rawData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      actions.uploadWorkoutData(file);
      toast.success('Uploading your workout data...');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Processing your workout data..." />;
  }

  // Welcome screen for new users
  if (showWelcome) {
    return (
      <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            {/* Hero Section */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center relative overflow-hidden"
              >
                <Brain className="w-16 h-16 text-white z-10" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6"
              >
                Welcome to MuscleMind Pro
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
              >
                The world's most advanced AI-powered workout analytics platform. 
                Upload your Strong app data and unlock insights that will revolutionize your training.
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {[
                {
                  icon: Brain,
                  title: "AI Predictions",
                  description: "See exactly where you'll be in 3, 6, and 12 months",
                  color: "from-purple-500 to-indigo-500"
                },
                {
                  icon: TrendingUp,
                  title: "Smart Analytics",
                  description: "Advanced metrics that reveal hidden patterns",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Target,
                  title: "Optimization",
                  description: "Personalized recommendations for maximum gains",
                  color: "from-emerald-500 to-teal-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.2 }}
                  className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-purple-500/30 transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              className="relative"
            >
              <div className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-500/20 rounded-3xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
                <p className="text-gray-300 mb-6">
                  Export your workout data from the Strong app and upload it here to begin your AI-powered fitness journey.
                </p>
                
                <label className="group cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all"
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    Upload Strong CSV File
                  </motion.div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                <p className="text-xs text-gray-400 mt-4">
                  💡 Export from Strong app: Settings → Export Data → CSV
                </p>
              </div>
            </motion.div>

            {/* Demo Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-8"
            >
              <button 
                onClick={() => {
                  // Load demo data
                  toast.info('Demo data coming soon!');
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
              >
                Or try with demo data →
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main dashboard with data
  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Training Dashboard
            </h1>
            <p className="text-gray-400">
              Welcome back! Here's your AI-powered training overview.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Level {level}</span>
              <span className="text-gray-400">•</span>
              <span className="text-purple-400">{xp} XP</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-all"
            >
              <Bell className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {[
            {
              label: 'Total Volume',
              value: analytics ? `${(analytics.totalVolume / 1000).toFixed(1)}K` : '0',
              unit: 'lbs',
              icon: BarChart3,
              color: 'from-purple-500 to-pink-500',
              change: '+12%'
            },
            {
              label: 'Workouts',
              value: analytics ? analytics.totalWorkouts : 0,
              unit: 'sessions',
              icon: Activity,
              color: 'from-blue-500 to-cyan-500',
              change: '+8%'
            },
            {
              label: 'Avg Duration',
              value: analytics ? Math.round(analytics.avgWorkoutDuration) : 0,
              unit: 'minutes',
              icon: Clock,
              color: 'from-emerald-500 to-teal-500',
              change: '+5%'
            },
            {
              label: 'Achievements',
              value: achievements.length,
              unit: 'unlocked',
              icon: Award,
              color: 'from-orange-500 to-red-500',
              change: '+3'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-green-400 font-medium">{stat.change}</span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Insights Panel */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl"
          >
            <div className="flex items-center mb-6">
              <Brain className="w-8 h-8 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">AI Insights</h2>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Live Analysis</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center mb-2">
                    <Flame className="w-5 h-5 text-orange-400 mr-2" />
                    <h3 className="text-white font-semibold">Progression Velocity</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your strength is increasing at 15% above average rate. Current trajectory suggests 
                    a 23% overall strength gain in the next 3 months.
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-green-400 mr-2" />
                    <h3 className="text-white font-semibold">Volume Optimization</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Consider increasing your weekly volume by 12% for optimal muscle growth. 
                    Focus on compound movements for maximum efficiency.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                    <h3 className="text-white font-semibold">Recovery Pattern</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your recovery metrics indicate optimal training frequency. 
                    Current 4.2 sessions per week aligns perfectly with your goals.
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center mb-2">
                    <Brain className="w-5 h-5 text-purple-400 mr-2" />
                    <h3 className="text-white font-semibold">Plateau Prevention</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    No plateaus detected. Your current progression rate is sustainable 
                    for the next 8-10 weeks before requiring periodization.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-white font-semibold">Future Projections</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Based on current trends, you'll likely achieve a 300lb bench press 
                    in approximately 14 weeks with 87% confidence.
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Full Analysis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Volume Over Time */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Volume Progression</h3>
                <div className="flex space-x-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        timeRange === range
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.volumeOverTime || []}>
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
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8b5cf6" 
                    fill="url(#volumeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Muscle Group Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Muscle Group Balance</h3>
              
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={Object.values(analytics.muscleGroups || {})}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <PolarRadiusAxis tick={{ fill: '#9ca3af' }} />
                  <Radar 
                    name="Volume" 
                    dataKey="volume" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* Recent Achievements & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Award className="w-6 h-6 text-yellow-400 mr-2" />
                Recent Achievements
              </h3>
              <button className="text-purple-400 hover:text-purple-300 text-sm">
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {achievements.slice(-3).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                >
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{achievement.title}</p>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                  <div className="text-yellow-400 font-bold">+{achievement.xp} XP</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Calendar, label: 'Plan Workout', color: 'from-blue-500 to-cyan-500' },
                { icon: TrendingUp, label: 'View Progress', color: 'from-green-500 to-emerald-500' },
                { icon: Download, label: 'Export Data', color: 'from-purple-500 to-pink-500' },
                { icon: Share2, label: 'Share Stats', color: 'from-orange-500 to-red-500' }
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 bg-gradient-to-r ${action.color} rounded-xl text-white font-medium flex flex-col items-center space-y-2 hover:shadow-lg transition-all`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;