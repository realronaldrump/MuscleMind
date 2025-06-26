import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Activity, Target, TrendingUp, Zap, Award, Brain, 
  Flame, BarChart3, Calendar, Clock, Users, Play,
  ChevronRight, Bell, Settings, Download, Share2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
         Radar, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { parseISO, subDays, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { rawData, analytics, predictions, loading, actions } = useWorkout();
  const { theme } = useTheme();
  const navigate = useNavigate();
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

  // Time filtering functions
  const filterDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case '7d':
        cutoffDate = subDays(now, 7);
        break;
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '90d':
        cutoffDate = subDays(now, 90);
        break;
      case 'all':
        return data; // Return all data for "all time"
      default:
        cutoffDate = subDays(now, 30);
    }
    
    return data.filter(item => {
      const itemDate = typeof item.date === 'string' ? parseISO(item.date) : item.date;
      return itemDate >= cutoffDate;
    });
  };

  // Get filtered volume data for charts
  const getFilteredVolumeData = () => {
    if (!analytics?.volumeOverTime) return [];
    return filterDataByTimeRange(analytics.volumeOverTime, timeRange);
  };

  // Button handlers
  const handleViewFullAnalysis = () => {
    navigate('/analytics');
    toast.success('Viewing detailed analytics...');
  };

  const handleQuickAction = (action) => {
    switch (action.label) {
      case 'Plan Workout':
        navigate('/workout-planner');
        toast.success('Opening workout planner...');
        break;
      case 'View Progress':
        navigate('/progress');
        toast.success('Opening progress tracker...');
        break;
      case 'Export Data':
        actions.exportData();
        break;
      case 'Share Stats':
        // Create shareable summary
        const summary = `💪 My MuscleMind Stats:\n• Total Volume: ${analytics ? (analytics.totalVolume / 1000).toFixed(1) : 0}K lbs\n• Workouts: ${analytics?.totalWorkouts || 0}\n• Consistency Score: ${analytics?.consistency?.score || 0}%`;
        navigator.clipboard.writeText(summary);
        toast.success('Stats copied to clipboard!');
        break;
      default:
        toast.info(`${action.label} coming soon!`);
    }
  };

  const handleViewAllRecords = () => {
    navigate('/progress?view=records');
    toast.success('Viewing all exercise records...');
  };

  // Generate real AI insights from actual data
  const generateRealInsights = () => {
    if (!analytics || !predictions) return [];

    const insights = [];

    // 1. Progression Velocity Analysis
    const topExercises = Object.values(analytics.exerciseStats)
      .filter(ex => ex.progression.confidence > 0.5)
      .sort((a, b) => b.progression.weeklyE1RMGain - a.progression.weeklyE1RMGain)
      .slice(0, 3);

    if (topExercises.length > 0) {
      const avgProgression = topExercises.reduce((sum, ex) => sum + ex.progression.weeklyE1RMGain, 0) / topExercises.length;
      const strengthGain = (avgProgression * 12) / topExercises[0].maxE1RM * 100; // 3 month projection as percentage
      
      insights.push({
        icon: 'Flame',
        title: 'Progression Velocity',
        content: `Your top exercises are progressing at ${avgProgression.toFixed(1)} lbs/week average. Current trajectory suggests ${strengthGain.toFixed(1)}% strength gain over the next 3 months with ${Math.round(topExercises[0].progression.confidence * 100)}% confidence.`
      });
    }

    // 2. Volume Optimization
    if (predictions.hypertrophyPotential) {
      const hypertrophy = predictions.hypertrophyPotential;
      const volumeRecommendation = hypertrophy.scores.volume < 70 ? 
        `Consider increasing your weekly volume by ${Math.round((70 - hypertrophy.scores.volume) * 0.5)}% for optimal muscle growth.` :
        `Your current weekly volume of ${hypertrophy.details.avgWeeklyVolume.toLocaleString()} lbs is optimal for muscle growth.`;
      
      insights.push({
        icon: 'Target',
        title: 'Volume Optimization',
        content: `${volumeRecommendation} ${hypertrophy.recommendations.length > 0 ? hypertrophy.recommendations[0] : ''}`
      });
    }

    // 3. Recovery Pattern Analysis
    if (analytics.fitnessFatigue && analytics.fitnessFatigue.length > 0) {
      const currentReadiness = analytics.fitnessFatigue[analytics.fitnessFatigue.length - 1];
      const avgWorkoutsPerWeek = analytics.weeklyTrends.length > 0 ? 
        analytics.weeklyTrends.reduce((sum, week) => sum + week.workouts, 0) / analytics.weeklyTrends.length : 0;
      
      const readinessStatus = currentReadiness.tsb > 5 ? 'optimal' : 
                            currentReadiness.tsb > -10 ? 'moderate' : 'high';
      
      insights.push({
        icon: 'Zap',
        title: 'Recovery Pattern',
        content: `Your current training readiness is ${readinessStatus} (TSB: ${currentReadiness.tsb.toFixed(1)}). Training frequency of ${avgWorkoutsPerWeek.toFixed(1)} sessions per week ${readinessStatus === 'optimal' ? 'aligns perfectly with your recovery capacity.' : 'may need adjustment for optimal recovery.'}`
      });
    }

    // 4. Plateau Prevention
    const recentWeeks = analytics.weeklyTrends.slice(-4);
    if (recentWeeks.length >= 4) {
      const volumeTrend = recentWeeks[recentWeeks.length - 1].volume - recentWeeks[0].volume;
      const trendDirection = volumeTrend > 0 ? 'increasing' : volumeTrend < 0 ? 'decreasing' : 'stable';
      
      insights.push({
        icon: 'Brain',
        title: 'Plateau Prevention',
        content: `Volume trend is ${trendDirection} over the last 4 weeks (${volumeTrend > 0 ? '+' : ''}${volumeTrend.toFixed(0)} lbs). ${volumeTrend > 0 ? 'Current progression rate is sustainable for 8-10 weeks before requiring periodization.' : 'Consider implementing progressive overload to avoid plateaus.'}`
      });
    }

    // 5. Future Projections
    if (predictions.strengthProjections) {
      const exercises = Object.values(predictions.strengthProjections);
      if (exercises.length > 0) {
        const bestExercise = exercises.reduce((best, ex) => 
          ex.timeframes[0].predictedE1RM > best.timeframes[0].predictedE1RM ? ex : best
        );
        
        insights.push({
          icon: 'TrendingUp',
          title: 'Future Projections',
          content: `Based on current trends, your ${bestExercise.name} is projected to reach ${bestExercise.timeframes[0].predictedE1RM} lbs in 3 months (currently ${bestExercise.currentE1RM} lbs). Confidence interval: ${bestExercise.timeframes[0].range[0]}-${bestExercise.timeframes[0].range[1]} lbs.`
        });
      }
    }

    // 6. Muscle Group Balance
    if (analytics.muscleGroups) {
      const groups = Object.values(analytics.muscleGroups);
      const avgVolume = groups.reduce((sum, g) => sum + g.totalVolume, 0) / groups.length;
      const imbalancedGroups = groups.filter(g => g.totalVolume < avgVolume * 0.7);
      
      if (imbalancedGroups.length > 0) {
        insights.push({
          icon: 'Target',
          title: 'Muscle Balance',
          content: `${imbalancedGroups.map(g => g.name).join(', ')} ${imbalancedGroups.length === 1 ? 'is' : 'are'} undertrained compared to other muscle groups. Consider adding ${Math.round((avgVolume - imbalancedGroups[0].totalVolume) / 1000)}K lbs more volume to improve balance.`
        });
      } else {
        insights.push({
          icon: 'Target',
          title: 'Muscle Balance',
          content: `Excellent muscle group balance detected across all major movement patterns. Your training distribution promotes balanced development and injury prevention.`
        });
      }
    }

    return insights.slice(0, 6); // Limit to 6 insights to fit the UI
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
          {(() => {
            // Calculate real percentage changes
            const getVolumeChange = () => {
              if (!analytics?.weeklyTrends || analytics.weeklyTrends.length < 2) return '+0%';
              const recent = analytics.weeklyTrends.slice(-2);
              const change = ((recent[1].volume - recent[0].volume) / recent[0].volume) * 100;
              return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
            };

            const getWorkoutChange = () => {
              if (!analytics?.weeklyTrends || analytics.weeklyTrends.length < 2) return '+0%';
              const recent = analytics.weeklyTrends.slice(-2);
              const change = recent[1].workouts - recent[0].workouts;
              return `${change > 0 ? '+' : ''}${change}`;
            };

            const getProgressingExercises = () => {
              if (!analytics?.exerciseStats) return 0;
              return Object.values(analytics.exerciseStats).filter(ex => ex.progression.weeklyE1RMGain > 0).length;
            };

            return [
              {
                label: 'Total Volume',
                value: analytics ? `${(analytics.totalVolume / 1000).toFixed(1)}K` : '0',
                unit: 'lbs',
                icon: BarChart3,
                color: 'from-purple-500 to-pink-500',
                change: getVolumeChange()
              },
              {
                label: 'Workouts',
                value: analytics ? analytics.totalWorkouts : 0,
                unit: 'sessions',
                icon: Activity,
                color: 'from-blue-500 to-cyan-500',
                change: getWorkoutChange()
              },
              {
                label: 'Avg Duration',
                value: analytics ? Math.round(analytics.avgWorkoutDuration) : 0,
                unit: 'minutes',
                icon: Clock,
                color: 'from-emerald-500 to-teal-500',
                change: analytics?.consistency ? `${analytics.consistency.score}%` : '0%'
              },
              {
                label: 'Progressing',
                value: getProgressingExercises(),
                unit: 'exercises',
                icon: Award,
                color: 'from-orange-500 to-red-500',
                change: analytics?.exerciseStats ? `${Object.keys(analytics.exerciseStats).length} total` : '0 total'
              }
            ];
          })().map((stat, index) => (
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
            
            {generateRealInsights().length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Analyzing your workout data...</p>
                <p className="text-gray-500 text-sm">Upload more workout data to get personalized AI insights</p>
              </div>
            ) : (
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {generateRealInsights().map((insight, index) => {
                // Dynamic icon mapping
                const IconComponent = {
                  'Flame': Flame,
                  'Target': Target,
                  'Zap': Zap,
                  'Brain': Brain,
                  'TrendingUp': TrendingUp
                }[insight.icon] || Target;
                
                const iconColors = {
                  'Flame': 'text-orange-400',
                  'Target': 'text-green-400',
                  'Zap': 'text-yellow-400',
                  'Brain': 'text-purple-400',
                  'TrendingUp': 'text-blue-400'
                };
                
                return (
                  <div key={index} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center mb-2">
                      <IconComponent className={`w-5 h-5 ${iconColors[insight.icon] || 'text-green-400'} mr-2`} />
                      <h3 className="text-white font-semibold">{insight.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {insight.content}
                    </p>
                  </div>
                );
              })}
              
              {generateRealInsights().length > 0 && (
                <div className="lg:col-span-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleViewFullAnalysis}
                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Full Analysis
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>
                             )}
            </div>
            )}
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
                  {[
                    { key: '7d', label: '7d' },
                    { key: '30d', label: '30d' },
                    { key: '90d', label: '90d' },
                    { key: 'all', label: 'All' }
                  ].map((range) => (
                    <button
                      key={range.key}
                      onClick={() => setTimeRange(range.key)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        timeRange === range.key
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {getFilteredVolumeData().length === 0 ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No data for this time range</p>
                    <p className="text-gray-500 text-sm">Try selecting a longer time period</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={getFilteredVolumeData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tickFormatter={(value) => {
                        try {
                          const date = typeof value === 'string' ? parseISO(value) : value;
                          return format(date, timeRange === '7d' ? 'MMM dd' : timeRange === '30d' ? 'MMM dd' : 'MMM yyyy');
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      labelFormatter={(value) => {
                        try {
                          const date = typeof value === 'string' ? parseISO(value) : value;
                          return format(date, 'MMM dd, yyyy');
                        } catch {
                          return value;
                        }
                      }}
                      formatter={(value) => [`${value.toLocaleString()} lbs`, 'Volume']}
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
              )}
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

        {/* Recent Personal Records & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Personal Records */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
            >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                <Award className="w-6 h-6 text-yellow-400 mr-2" />
                Recent Personal Records
                </h3>
                <button 
                  onClick={handleViewAllRecords}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                View All
                </button>
            </div>

            <div className="space-y-3">
                {analytics?.exerciseStats && Object.values(analytics.exerciseStats)
                  .sort((a, b) => b.maxWeight - a.maxWeight)
                  .slice(0, 3)
                  .map((exercise, index) => {
                    const daysAgo = Math.round((new Date() - new Date(exercise.lastPerformed)) / (1000 * 60 * 60 * 24));
                    return (
                      <motion.div
                        key={exercise.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                      >
                        <div className="text-2xl mr-3">🏆</div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{exercise.name}</p>
                          <p className="text-gray-400 text-sm">
                            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">{exercise.maxWeight} lbs</div>
                          <div className="text-gray-400 text-xs">Max weight</div>
                        </div>
                      </motion.div>
                    );
                  }) || (
                <p className="text-gray-400 text-sm">No exercise data available</p>
                )}
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
                  onClick={() => handleQuickAction(action)}
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