import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Target, Zap, Activity, Clock, 
  Calendar, Filter, Download, Share2, Eye, EyeOff,
  ChevronDown, RotateCcw, Maximize2, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ComposedChart, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const { analytics, rawData, loading } = useWorkout();
  const { theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [viewMode, setViewMode] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState('line');

  // Advanced filters
  const [filters, setFilters] = useState({
    muscleGroups: [],
    exerciseTypes: [],
    dateRange: { start: null, end: null },
    volumeRange: { min: 0, max: 100000 },
    intensityRange: { min: 0, max: 100 }
  });

  // Processed data for different chart types
  const chartData = useMemo(() => {
    if (!analytics) return {};

    const volumeOverTime = analytics.volumeOverTime || [];
    const strengthOverTime = analytics.strengthOverTime || [];
    const exerciseStats = analytics.exerciseStats || {};

    return {
      volumeProgression: volumeOverTime.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(),
        cumulativeVolume: volumeOverTime
          .slice(0, volumeOverTime.indexOf(item) + 1)
          .reduce((sum, d) => sum + d.volume, 0)
      })),
      
      strengthProgression: Object.entries(exerciseStats)
        .slice(0, 5)
        .map(([exercise, stats]) => ({
          exercise: exercise.substring(0, 15) + '...',
          maxWeight: stats.maxWeight,
          totalVolume: stats.totalVolume,
          progressionRate: stats.progressionRate || 0,
          sessions: stats.sessions
        })),

      muscleGroupDistribution: Object.values(analytics.muscleGroups || {})
        .map(group => ({
          name: group.name,
          volume: group.totalVolume,
          percentage: ((group.totalVolume / analytics.totalVolume) * 100).toFixed(1)
        })),

      performanceMatrix: Object.entries(exerciseStats)
        .slice(0, 20)
        .map(([exercise, stats]) => ({
          exercise: exercise.substring(0, 20),
          efficiency: (stats.totalVolume / stats.sessions) / 1000,
          progression: stats.progressionRate || 0,
          consistency: Math.min(100, (stats.sessions / analytics.totalWorkouts) * 100),
          maxWeight: stats.maxWeight
        })),

      weeklyTrends: analytics.weeklyTrends || [],
      
      intensityDistribution: generateIntensityDistribution(rawData),
      
      recoveryPatterns: generateRecoveryPatterns(rawData),
      
      plateauAnalysis: generatePlateauAnalysis(exerciseStats)
    };
  }, [analytics, rawData, filters]);

  const metrics = [
    { id: 'volume', label: 'Volume', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { id: 'strength', label: 'Strength', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { id: 'consistency', label: 'Consistency', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { id: 'efficiency', label: 'Efficiency', icon: Target, color: 'from-orange-500 to-red-500' },
    { id: 'recovery', label: 'Recovery', icon: Clock, color: 'from-indigo-500 to-purple-500' }
  ];

  const chartTypes = [
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
    { id: 'area', label: 'Area Chart', icon: Activity },
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'scatter', label: 'Scatter Plot', icon: Target }
  ];

  if (loading) {
    return <LoadingSpinner message="Analyzing your workout data..." />;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen lg:ml-80 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-gray-400">Upload your workout data to see detailed analytics.</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const data = chartData[`${selectedMetric}Progression`] || chartData.volumeProgression;
    
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
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
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8b5cf6" 
                fill="url(#volumeGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.strengthProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="exercise" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <Bar dataKey="maxWeight" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData.performanceMatrix}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="efficiency" stroke="#9ca3af" name="Efficiency" />
              <YAxis dataKey="progression" stroke="#9ca3af" name="Progression" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }} 
              />
              <Scatter name="Exercises" dataKey="maxWeight" fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
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
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeVolume" 
                stroke="#06b6d4" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

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
              Advanced Analytics
            </h1>
            <p className="text-gray-400">
              Deep dive into your performance metrics and training patterns
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-xl border transition-all ${
                showFilters 
                  ? 'bg-purple-500 border-purple-500 text-white' 
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Muscle Groups</label>
                  <div className="flex flex-wrap gap-2">
                    {['chest', 'back', 'shoulders', 'arms', 'legs'].map(group => (
                      <button
                        key={group}
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            muscleGroups: prev.muscleGroups.includes(group)
                              ? prev.muscleGroups.filter(g => g !== group)
                              : [...prev.muscleGroups, group]
                          }));
                        }}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          filters.muscleGroups.includes(group)
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Chart Type</label>
                  <div className="flex space-x-2">
                    {chartTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setChartType(type.id)}
                        className={`p-2 rounded-lg transition-all ${
                          chartType === type.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-gray-400 hover:text-white'
                        }`}
                        title={type.label}
                      >
                        <type.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilters({
                        muscleGroups: [],
                        exerciseTypes: [],
                        dateRange: { start: null, end: null },
                        volumeRange: { min: 0, max: 100000 },
                        intensityRange: { min: 0, max: 100 }
                      });
                      toast.success('Filters reset');
                    }}
                    className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metric Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          {metrics.map((metric) => (
            <motion.button
              key={metric.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                selectedMetric === metric.id
                  ? `bg-gradient-to-r ${metric.color} text-white shadow-lg`
                  : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <metric.icon className="w-5 h-5 mr-2" />
              {metric.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {metrics.find(m => m.id === selectedMetric)?.label} Analysis
              </h2>
              <p className="text-gray-400">
                Detailed view of your {selectedMetric} progression over time
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <Maximize2 className="w-5 h-5" />
            </motion.button>
          </div>
          
          {renderChart()}
        </motion.div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Muscle Group Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Muscle Group Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.muscleGroupDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="volume"
                >
                  {chartData.muscleGroupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Exercise Performance Matrix</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData.performanceMatrix.slice(0, 6)}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="exercise" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar
                  name="Efficiency"
                  dataKey="efficiency"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Progression"
                  dataKey="progression"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Advanced Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Training Consistency',
              value: analytics.consistencyData?.consistency?.toFixed(1) || '0',
              unit: '%',
              trend: '+5.2%',
              description: 'Average gap between workouts',
              color: 'from-green-500 to-emerald-500'
            },
            {
              title: 'Volume Efficiency',
              value: (analytics.totalVolume / analytics.totalWorkouts / 1000).toFixed(1),
              unit: 'K lbs/session',
              trend: '+12.3%',
              description: 'Volume per workout session',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'Progression Rate',
              value: Object.values(analytics.progressionRates || {})
                .filter(rate => rate > 0)
                .reduce((avg, rate, _, arr) => avg + rate / arr.length, 0)
                .toFixed(1),
              unit: 'lbs/week',
              trend: '+8.7%',
              description: 'Average strength gain per week',
              color: 'from-purple-500 to-pink-500'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${metric.color} rounded-xl group-hover:scale-110 transition-transform`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400 font-medium">{metric.trend}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-white">{metric.value}</span>
                <span className="text-gray-400">{metric.unit}</span>
              </div>
              <p className="text-sm text-gray-400">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// Helper functions for generating chart data
const generateIntensityDistribution = (rawData) => {
  const intensityBuckets = { low: 0, medium: 0, high: 0, extreme: 0 };
  
  rawData.forEach(row => {
    const reps = row.Reps || 0;
    if (reps >= 15) intensityBuckets.low++;
    else if (reps >= 8) intensityBuckets.medium++;
    else if (reps >= 4) intensityBuckets.high++;
    else intensityBuckets.extreme++;
  });
  
  return Object.entries(intensityBuckets).map(([intensity, count]) => ({
    intensity,
    count,
    percentage: ((count / rawData.length) * 100).toFixed(1)
  }));
};

const generateRecoveryPatterns = (rawData) => {
  // Implementation for recovery pattern analysis
  const workoutDates = [...new Set(rawData.map(row => row.Date))].sort();
  const gaps = [];
  
  for (let i = 1; i < workoutDates.length; i++) {
    const gap = Math.floor((new Date(workoutDates[i]) - new Date(workoutDates[i-1])) / (1000 * 60 * 60 * 24));
    gaps.push(gap);
  }
  
  return [
    { period: '1 day', frequency: gaps.filter(g => g === 1).length },
    { period: '2 days', frequency: gaps.filter(g => g === 2).length },
    { period: '3+ days', frequency: gaps.filter(g => g >= 3).length },
  ];
};

const generatePlateauAnalysis = (exerciseStats) => {
  return Object.entries(exerciseStats || {})
    .map(([exercise, stats]) => ({
      exercise: exercise.substring(0, 15),
      plateauRisk: stats.progressionRate < 0.1 ? 'High' : stats.progressionRate < 0.5 ? 'Medium' : 'Low',
      lastGain: stats.progressionRate || 0,
      recommendation: stats.progressionRate < 0.1 ? 'Change routine' : 'Continue current plan'
    }))
    .slice(0, 8);
};

export default Analytics;