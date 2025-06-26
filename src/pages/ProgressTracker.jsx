import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, Camera, Plus, ArrowUp, ArrowDown, Filter, Search, BarChart3, Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { format, parseISO, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import DrillDownModal from '../components/DrillDownModal';

const ProgressTracker = () => {
  const { analytics, rawData } = useWorkout();

  const [selectedMetric, setSelectedMetric] = useState('strength');
  const [timeRange, setTimeRange] = useState('3m');
  const [activeView, setActiveView] = useState('overview');
  const [sortBy, setSortBy] = useState('weight');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('all');
  const [drillDownModal, setDrillDownModal] = useState({ isOpen: false, content: null });

  // Check URL params to determine initial view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'records') {
      setActiveView('records');
    }
  }, []);

  const metrics = [
    { id: 'strength', label: 'Strength', color: 'from-red-500 to-orange-500', icon: Award },
    { id: 'volume', label: 'Volume', color: 'from-purple-500 to-pink-500', icon: BarChart3 },
    { id: 'frequency', label: 'Frequency', color: 'from-blue-500 to-cyan-500', icon: Activity }
  ];

  // Calculate strength progression over time (average E1RM across all exercises)
  const calculateStrengthOverTime = () => {
    if (!rawData || rawData.length === 0) return [];

    const dateGroups = {};
    rawData.forEach(row => {
      const date = row.Date;
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      
      const weight = parseFloat(row.Weight) || 0;
      const reps = parseInt(row.Reps) || 1;
      const e1rm = weight * (1 + (reps - 1) * 0.033); // Epley formula

      dateGroups[date].push({
        exercise: row['Exercise Name'],
        e1rm: e1rm
      });
    });

    return Object.entries(dateGroups)
      .map(([date, exercises]) => {
        const avgE1RM = exercises.reduce((sum, ex) => sum + ex.e1rm, 0) / exercises.length;
        return {
          date,
          strength: Math.round(avgE1RM),
          value: Math.round(avgE1RM)
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-12); // Last 12 data points
  };

  // Calculate workout frequency over time (workouts per week)
  const calculateFrequencyOverTime = () => {
    if (!rawData || rawData.length === 0) return [];

    const uniqueDates = [...new Set(rawData.map(row => row.Date))].sort();
    if (uniqueDates.length < 2) return [];

    const startDate = new Date(uniqueDates[0]);
    const endDate = new Date(uniqueDates[uniqueDates.length - 1]);

    const weeks = eachWeekOfInterval({ start: startDate, end: endDate });

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const workoutsThisWeek = uniqueDates.filter(date => {
        const d = new Date(date);
        return d >= startOfWeek(weekStart) && d <= weekEnd;
      }).length;

      return {
        date: format(weekStart, 'yyyy-MM-dd'),
        frequency: workoutsThisWeek,
        value: workoutsThisWeek
      };
    }).slice(-12);
  };

  // Calculate chart data based on selected metric
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    switch (selectedMetric) {
      case 'strength':
        return calculateStrengthOverTime();
      case 'volume':
        return analytics?.volumeOverTime || [];
      case 'frequency':
        return calculateFrequencyOverTime();
      default:
        return analytics?.volumeOverTime || [];
    }
  }, [selectedMetric, rawData, analytics]);

  // Calculate days active from raw data
  const calculateDaysActive = () => {
    if (!rawData || rawData.length === 0) return 0;
    const uniqueDates = new Set(rawData.map(row => row.Date));
    return uniqueDates.size;
  };

  // Calculate workout frequency
  const calculateWorkoutFrequency = () => {
    if (!rawData || rawData.length === 0) return 0;
    const uniqueDates = new Set(rawData.map(row => row.Date));
    const sortedDates = Array.from(uniqueDates).sort();
    
    if (sortedDates.length < 2) return 0;
    
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 ? (uniqueDates.size / daysDiff * 7).toFixed(1) : 0; // workouts per week
  };

  // Get all exercise records for the records view with proper sorting
  const getAllExerciseRecords = () => {
    if (!analytics?.exerciseStats) return [];
    
    const filtered = Object.values(analytics.exerciseStats)
      .filter(exercise => {
        if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (filterMuscleGroup !== 'all' && exercise.muscleGroup !== filterMuscleGroup) {
          return false;
        }
        return true;
      });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'weight':
          aValue = a.maxWeight || 0;
          bValue = b.maxWeight || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.lastPerformed || 0);
          bValue = new Date(b.lastPerformed || 0);
          break;
        case 'e1rm':
          aValue = a.maxE1RM || 0;
          bValue = b.maxE1RM || 0;
          break;
        case 'progression':
          aValue = a.progression?.weeklyE1RMGain || 0;
          bValue = b.progression?.weeklyE1RMGain || 0;
          break;
        case 'sets':
          aValue = a.sets || 0;
          bValue = b.sets || 0;
          break;
        default:
          aValue = a.maxWeight || 0;
          bValue = b.maxWeight || 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  };

  // Get unique muscle groups for filtering
  const getMuscleGroups = () => {
    if (!analytics?.exerciseStats) return [];
    const groups = [...new Set(Object.values(analytics.exerciseStats).map(ex => ex.muscleGroup))];
    return groups.sort();
  };

  // Calculate total volume change
  const calculateVolumeChange = () => {
    if (!analytics?.volumeOverTime || analytics.volumeOverTime.length < 2) return '+0';
    const recent = analytics.volumeOverTime.slice(-4); // last 4 data points
    if (recent.length < 2) return '+0';
    
    const oldVolume = recent[0].volume;
    const newVolume = recent[recent.length - 1].volume;
    const change = newVolume - oldVolume;
    
    return change > 0 ? `+${Math.round(change / 1000)}k` : `${Math.round(change / 1000)}k`;
  };

  // Calculate exercises change (new exercises in recent period)
  const calculateExerciseChange = () => {
    if (!rawData || rawData.length === 0) return '+0';
    
    // Get exercises from last 30 days vs previous period
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const recentExercises = new Set(
      rawData
        .filter(row => new Date(row.Date) >= thirtyDaysAgo)
        .map(row => row['Exercise Name'])
    );
    
    const previousExercises = new Set(
      rawData
        .filter(row => new Date(row.Date) >= sixtyDaysAgo && new Date(row.Date) < thirtyDaysAgo)
        .map(row => row['Exercise Name'])
    );
    
    const newExercises = [...recentExercises].filter(ex => !previousExercises.has(ex));
    return newExercises.length > 0 ? `+${newExercises.length}` : '0';
  };

  // Drill down handlers
  const handleMetricDrillDown = (metricType, value, label) => {
    let content = {
      title: `${label} Analysis`,
      icon: metrics.find(m => m.id === metricType)?.icon || BarChart3,
      sections: []
    };

    switch (metricType) {
      case 'daysActive':
        content.sections = [
          {
            subtitle: 'What it means',
            text: `You have been active for ${value} unique workout days. This represents your consistency and commitment to your fitness routine.`
          },
          {
            subtitle: 'How it was calculated',
            text: 'We count each unique date where you logged at least one exercise set. Multiple exercises on the same day count as one active day.'
          },
          {
            subtitle: 'Your Key Data',
            text: `• Active Days: ${value}\n• Average Frequency: ${calculateWorkoutFrequency()} workouts per week\n• Total Exercises: ${analytics?.exerciseStats ? Object.keys(analytics.exerciseStats).length : 0}`
          }
        ];
        break;
      
      case 'totalWorkouts':
        content.sections = [
          {
            subtitle: 'What it means',
            text: `You have completed ${value} total workouts. This metric shows your overall training volume and dedication.`
          },
          {
            subtitle: 'How it was calculated',
            text: 'Each unique date with logged exercises counts as one workout session.'
          },
          {
            subtitle: 'Your Key Data',
            text: `• Total Workouts: ${value}\n• Frequency: ${calculateWorkoutFrequency()} per week\n• Most Recent: ${rawData?.length > 0 ? new Date(Math.max(...rawData.map(r => new Date(r.Date)))).toLocaleDateString() : 'N/A'}`
          }
        ];
        break;

      case 'totalVolume':
        content.sections = [
          {
            subtitle: 'What it means',
            text: `Your total training volume is ${value}. Volume = Weight × Reps × Sets, representing the total mechanical work performed.`
          },
          {
            subtitle: 'How it was calculated',
            text: 'We sum up (Weight × Reps) for every set across all your exercises and workouts.'
          },
          {
            subtitle: 'Your Key Data',
            text: `• Total Volume: ${value}\n• Volume Change: ${calculateVolumeChange()}\n• Average per Workout: ${analytics?.totalVolume && analytics?.totalWorkouts ? Math.round(analytics.totalVolume / analytics.totalWorkouts).toLocaleString() : 'N/A'} lbs`,
            chartData: analytics?.volumeOverTime?.slice(-10),
            chartKey: 'volume'
          }
        ];
        break;

      case 'exercises':
        content.sections = [
          {
            subtitle: 'What it means',
            text: `You have performed ${value} different exercises. Exercise variety helps target different muscle groups and prevents plateaus.`
          },
          {
            subtitle: 'How it was calculated',
            text: 'We count each unique exercise name that appears in your workout data.'
          },
          {
            subtitle: 'Your Key Data',
            text: `• Total Exercises: ${value}\n• New This Month: ${calculateExerciseChange()}\n• Most Popular: ${analytics?.exerciseStats ? Object.values(analytics.exerciseStats).sort((a, b) => b.sets - a.sets)[0]?.name || 'N/A' : 'N/A'}`
          }
        ];
        break;
    }

    setDrillDownModal({ isOpen: true, content });
  };

  const handleExerciseDrillDown = (exercise) => {
    // Get exercise-specific data from raw data
    const exerciseData = rawData.filter(row => row['Exercise Name'] === exercise.name);
    const dates = [...new Set(exerciseData.map(row => row.Date))].sort();
    
    // Calculate progression over time
    const progressionData = dates.map(date => {
      const dayData = exerciseData.filter(row => row.Date === date);
      const maxWeight = Math.max(...dayData.map(row => parseFloat(row.Weight) || 0));
      const maxReps = Math.max(...dayData.map(row => parseInt(row.Reps) || 1));
      const e1rm = maxWeight * (1 + (maxReps - 1) * 0.033);
      
      return {
        date,
        maxWeight,
        e1rm: Math.round(e1rm),
        sets: dayData.length
      };
    });

    const content = {
      title: exercise.name,
      icon: Target,
      sections: [
        {
          subtitle: 'Exercise Overview',
          text: `Muscle Group: ${exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)}\nTotal Sets: ${exercise.sets}\nTotal Volume: ${exercise.totalVolume.toLocaleString()} lbs\nFirst Performed: ${dates[0]}\nLast Performed: ${exercise.lastPerformed}`
        },
        {
          subtitle: 'Personal Records',
          text: `Max Weight: ${exercise.maxWeight} lbs\nEstimated 1RM: ${Math.round(exercise.maxE1RM)} lbs\nBest Single Set: ${exercise.maxWeight} lbs × ${exerciseData.find(row => parseFloat(row.Weight) === exercise.maxWeight)?.Reps || 1} reps`
        },
        {
          subtitle: 'Progression Analysis',
          text: `Weekly Gain: ${exercise.progression?.weeklyE1RMGain > 0 ? '+' : ''}${exercise.progression?.weeklyE1RMGain.toFixed(1)} lbs/week\nConfidence: ${Math.round(exercise.progression?.confidence * 100)}%\nTotal Sessions: ${dates.length}`,
          chartData: progressionData.slice(-10),
          chartKey: 'e1rm'
        }
      ]
    };

    setDrillDownModal({ isOpen: true, content });
  };

  // Get chart data key based on selected metric
  const getChartDataKey = () => {
    switch (selectedMetric) {
      case 'strength':
        return 'strength';
      case 'volume':
        return 'volume';
      case 'frequency':
        return 'frequency';
      default:
        return 'volume';
    }
  };

  // Get chart color based on selected metric
  const getChartColor = () => {
    const metric = metrics.find(m => m.id === selectedMetric);
    return metric?.id === 'strength' ? '#ef4444' : 
           metric?.id === 'frequency' ? '#06b6d4' : '#8b5cf6';
  };

  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Progress Tracker</h1>
            <p className="text-gray-400">Track your transformation journey</p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeView === 'overview'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('records')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeView === 'records'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-gray-400 hover:text-white'
              }`}
            >
              All Records
            </button>
          </div>
        </motion.div>

        {/* Conditional Content */}
        {activeView === 'overview' ? (
          <>
            {/* Progress Overview - Now clickable */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {[
                { 
                  label: 'Days Active', 
                  value: calculateDaysActive().toString(), 
                  change: `${calculateWorkoutFrequency()}/week`, 
                  icon: Calendar,
                  key: 'daysActive'
                },
                { 
                  label: 'Total Workouts', 
                  value: analytics?.totalWorkouts || '0', 
                  change: `${calculateWorkoutFrequency()} per week`, 
                  icon: TrendingUp,
                  key: 'totalWorkouts'
                },
                { 
                  label: 'Total Volume', 
                  value: analytics?.totalVolume ? `${Math.round(analytics.totalVolume / 1000)}k` : '0', 
                  change: calculateVolumeChange(), 
                  icon: Award,
                  key: 'totalVolume'
                },
                { 
                  label: 'Exercises', 
                  value: analytics?.exerciseStats ? Object.keys(analytics.exerciseStats).length : '0', 
                  change: calculateExerciseChange(), 
                  icon: Target,
                  key: 'exercises'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl cursor-pointer hover:bg-slate-700/50 transition-all"
                  onClick={() => handleMetricDrillDown(stat.key, stat.value, stat.label)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-8 h-8 text-purple-400" />
                    <span className="text-blue-400 text-sm font-medium">{stat.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-xs text-purple-400 mt-2">Click for details</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Progress Chart - Now properly switches metrics */}
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
                        className={`px-3 py-1 rounded-lg text-sm transition-all flex items-center space-x-1 ${
                          selectedMetric === metric.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <metric.icon className="w-4 h-4" />
                        <span>{metric.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
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
                          <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={getChartColor()} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey={getChartDataKey()} 
                        stroke={getChartColor()} 
                        fill="url(#progressGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">No workout data available</p>
                      <p className="text-gray-500 text-sm">Upload your workout data to see progress trends</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Progress Photos Section - Show when no data */}
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

              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No progress photos yet</p>
                <p className="text-gray-500 text-sm">Add your first progress photo to track your transformation</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all flex items-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Photo
                </motion.button>
              </div>
            </motion.div>
          </>
        ) : (
          /* All Records View - Now with working table sorting and drill-down */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filter Controls */}
            <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Muscle Group Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={filterMuscleGroup}
                    onChange={(e) => setFilterMuscleGroup(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Groups</option>
                    {getMuscleGroups().map(group => (
                      <option key={group} value={group}>
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="weight">Max Weight</option>
                    <option value="e1rm">Est. 1RM</option>
                    <option value="progression">Progression</option>
                    <option value="name">Name</option>
                    <option value="date">Last Performed</option>
                    <option value="sets">Total Sets</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6">All Exercise Records</h2>
              
              {getAllExerciseRecords().length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No records found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or upload more workout data</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Exercise</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Muscle Group</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Max Weight</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Est. 1RM</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Sets</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Progression</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Last Performed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllExerciseRecords().map((exercise, index) => {
                        const daysAgo = Math.round((new Date() - new Date(exercise.lastPerformed)) / (1000 * 60 * 60 * 24));
                        const progressionColor = exercise.progression?.weeklyE1RMGain > 0 ? 'text-green-400' : 
                                               exercise.progression?.weeklyE1RMGain < 0 ? 'text-red-400' : 'text-gray-400';
                        
                        return (
                          <motion.tr
                            key={exercise.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                            onClick={() => handleExerciseDrillDown(exercise)}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-white font-medium">{exercise.name}</p>
                                <p className="text-gray-400 text-sm">{exercise.totalVolume.toLocaleString()} lbs total</p>
                                <p className="text-xs text-purple-400">Click for details</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                                {exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-white font-bold">{exercise.maxWeight} lbs</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-white font-bold">{Math.round(exercise.maxE1RM)} lbs</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-gray-300">{exercise.sets}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className={`font-medium ${progressionColor}`}>
                                {exercise.progression?.weeklyE1RMGain > 0 ? '+' : ''}
                                {exercise.progression?.weeklyE1RMGain.toFixed(1)} lbs/week
                              </p>
                              <p className="text-gray-400 text-xs">
                                {Math.round(exercise.progression?.confidence * 100)}% confidence
                              </p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-gray-300">
                                {daysAgo === 0 ? 'Today' : 
                                 daysAgo === 1 ? 'Yesterday' : 
                                 `${daysAgo} days ago`}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {format(new Date(exercise.lastPerformed), 'MMM dd, yyyy')}
                              </p>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary Stats for Filtered Records */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
                <p className="text-gray-400 text-sm">Total Exercises</p>
                <p className="text-2xl font-bold text-white">{getAllExerciseRecords().length}</p>
              </div>
              <div className="p-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
                <p className="text-gray-400 text-sm">Progressing</p>
                <p className="text-2xl font-bold text-green-400">
                  {getAllExerciseRecords().filter(ex => ex.progression?.weeklyE1RMGain > 0).length}
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
                <p className="text-gray-400 text-sm">Avg Progression</p>
                <p className="text-2xl font-bold text-purple-400">
                  {getAllExerciseRecords().length > 0 
                    ? (getAllExerciseRecords().reduce((sum, ex) => sum + (ex.progression?.weeklyE1RMGain || 0), 0) / getAllExerciseRecords().length).toFixed(1)
                    : '0.0'
                  } lbs/week
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Drill Down Modal */}
        <DrillDownModal
          isOpen={drillDownModal.isOpen}
          onClose={() => setDrillDownModal({ isOpen: false, content: null })}
          content={drillDownModal.content}
        />
      </div>
    </div>
  );
};

export default ProgressTracker;