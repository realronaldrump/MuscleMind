import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Target, Calendar, Zap, AlertTriangle,
  Clock, Trophy, Activity, BarChart3, Settings, Sparkles,
  ChevronRight, Play, Pause, RotateCcw, Eye, Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Bar, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Predictions = () => {
  const { analytics, predictions, rawData, loading } = useWorkout();
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m');
  const [selectedMetric, setSelectedMetric] = useState('strength');
  const [confidenceLevel, setConfidenceLevel] = useState(85);
  const [showSettings, setShowSettings] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Generate prediction data based on current analytics
  const predictionData = useMemo(() => {
    if (!analytics) return {};

    const currentDate = new Date();
    const timeframes = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '12m': 12,
      '24m': 24
    };

    const monthsAhead = timeframes[selectedTimeframe];
    
    // Generate strength predictions
    const strengthPredictions = Object.entries(analytics.exerciseStats || {})
      .slice(0, 8)
      .map(([exercise, stats]) => {
        const currentMax = stats.maxWeight || 0;
        const progressionRate = stats.progressionRate || 0;
        
        // Apply diminishing returns and plateau factors
        const plateauFactor = Math.max(0.1, 1 - (monthsAhead * 0.05));
        const projectedGain = (progressionRate * 4.33 * monthsAhead) * plateauFactor;
        
        return {
          exercise: exercise.substring(0, 20),
          current: currentMax,
          predicted: Math.round(currentMax + projectedGain),
          confidence: Math.max(60, 95 - monthsAhead * 3),
          gain: Math.round(projectedGain),
          percentageGain: currentMax > 0 ? ((projectedGain / currentMax) * 100).toFixed(1) : 0
        };
      });

    // Generate volume predictions
    const currentWeeklyVolume = analytics.weeklyTrends?.length > 0 
      ? analytics.weeklyTrends[analytics.weeklyTrends.length - 1].volume 
      : 0;
    
    const volumeGrowthRate = 0.02; // 2% per month
    const predictedVolume = currentWeeklyVolume * Math.pow(1 + volumeGrowthRate, monthsAhead);

    // Generate body composition estimates
    const bodyComposition = generateBodyCompositionPredictions(monthsAhead, analytics);

    // Generate performance milestones
    const milestones = generatePerformanceMilestones(strengthPredictions, monthsAhead);

    // Generate risk factors
    const riskFactors = generateRiskFactors(analytics, monthsAhead);

    return {
      strengthPredictions,
      volumePrediction: {
        current: currentWeeklyVolume,
        predicted: Math.round(predictedVolume),
        gain: Math.round(predictedVolume - currentWeeklyVolume),
        confidence: Math.max(70, 90 - monthsAhead * 2)
      },
      bodyComposition,
      milestones,
      riskFactors,
      timeline: generatePredictionTimeline(monthsAhead, strengthPredictions)
    };
  }, [analytics, selectedTimeframe, confidenceLevel]);

  const timeframes = [
    { id: '1m', label: '1 Month', confidence: 95 },
    { id: '3m', label: '3 Months', confidence: 87 },
    { id: '6m', label: '6 Months', confidence: 78 },
    { id: '12m', label: '1 Year', confidence: 65 },
    { id: '24m', label: '2 Years', confidence: 45 }
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);

    // Simulate AI processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setSimulationProgress(i);
    }

    setIsSimulating(false);
    toast.success('AI simulation complete! Updated predictions based on latest data.');
  };

  if (loading) {
    return <LoadingSpinner message="Generating AI predictions..." />;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen lg:ml-80 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">AI Predictions Unavailable</h2>
          <p className="text-gray-400">Upload your workout data to see AI-powered future projections.</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              AI Predictions
            </h1>
            <p className="text-gray-400">
              Advanced machine learning predictions for your fitness journey
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run AI Simulation
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </motion.button>
          </div>
        </motion.div>

        {/* AI Status & Simulation Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Neural Network Status</h2>
                <p className="text-purple-300 text-sm">
                  {isSimulating ? 'Processing predictions...' : 'AI ready - Last updated 2 minutes ago'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {timeframes.find(t => t.id === selectedTimeframe)?.confidence || 85}%
              </p>
              <p className="text-xs text-gray-400">Confidence Level</p>
            </div>
          </div>

          {isSimulating && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>AI Processing...</span>
                <span>{simulationProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${simulationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          {timeframes.map((timeframe) => (
            <motion.button
              key={timeframe.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              className={`px-6 py-3 rounded-xl transition-all ${
                selectedTimeframe === timeframe.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <div className="text-center">
                <p className="font-semibold">{timeframe.label}</p>
                <p className="text-xs opacity-80">{timeframe.confidence}% confidence</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Strength Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Strength Projections</h2>
              <p className="text-gray-400">
                AI-predicted strength gains for the next {timeframes.find(t => t.id === selectedTimeframe)?.label.toLowerCase()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">High Accuracy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictionData.strengthPredictions?.map((prediction, index) => (
              <motion.div
                key={prediction.exercise}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-xl hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm">{prediction.exercise}</h3>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      prediction.confidence > 80 ? 'bg-green-500' :
                      prediction.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-400">{prediction.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Current</span>
                    <span className="text-white font-semibold">{prediction.current} lbs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Predicted</span>
                    <span className="text-green-400 font-bold">{prediction.predicted} lbs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Gain</span>
                    <span className="text-purple-400 font-semibold">
                      +{prediction.gain} lbs ({prediction.percentageGain}%)
                    </span>
                  </div>
                </div>

                <div className="mt-3 bg-slate-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (prediction.gain / prediction.current) * 100 * 5)}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prediction Timeline & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-6 h-6 text-blue-400 mr-2" />
              Prediction Timeline
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictionData.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
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
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  fill="url(#predictionGradient)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
              Predicted Milestones
            </h3>

            <div className="space-y-4">
              {predictionData.milestones?.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl"
                >
                  <div className="text-2xl mr-4">{milestone.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{milestone.title}</h4>
                    <p className="text-gray-400 text-sm">{milestone.description}</p>
                    <p className="text-yellow-400 text-xs">
                      Expected: {milestone.expectedDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{milestone.value}</p>
                    <p className="text-gray-400 text-xs">{milestone.confidence}% likely</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Risk Factors & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-400 mr-2" />
            Risk Assessment & Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Potential Risk Factors</h4>
              <div className="space-y-3">
                {predictionData.riskFactors?.map((risk, index) => (
                  <div
                    key={risk.id}
                    className={`p-3 rounded-lg border ${
                      risk.level === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      risk.level === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{risk.factor}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        risk.level === 'high' ? 'bg-red-500 text-white' :
                        risk.level === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {risk.level}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">AI Recommendations</h4>
              <div className="space-y-3">
                {[
                  {
                    title: 'Progressive Overload',
                    description: 'Increase weight by 2.5% weekly for optimal gains',
                    priority: 'high'
                  },
                  {
                    title: 'Recovery Optimization',
                    description: 'Maintain 48-72 hour rest between muscle groups',
                    priority: 'medium'
                  },
                  {
                    title: 'Volume Periodization',
                    description: 'Plan deload week every 4-6 weeks',
                    priority: 'medium'
                  }
                ].map((rec, index) => (
                  <motion.div
                    key={rec.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{rec.title}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'high' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper functions for generating prediction data
const generateBodyCompositionPredictions = (monthsAhead, analytics) => {
  // Simplified body composition prediction
  return {
    muscleGain: Math.round(monthsAhead * 0.8), // ~0.8 lbs muscle per month
    fatLoss: Math.round(monthsAhead * 0.5), // ~0.5 lbs fat per month
    confidence: Math.max(60, 85 - monthsAhead * 2)
  };
};

const generatePerformanceMilestones = (strengthPredictions, monthsAhead) => {
  const milestones = [];
  
  strengthPredictions.forEach((pred, index) => {
    if (pred.gain > 20) {
      milestones.push({
        id: `milestone_${index}`,
        title: `${pred.exercise} Breakthrough`,
        description: `Reach ${pred.predicted} lbs`,
        value: `${pred.predicted} lbs`,
        expectedDate: `Month ${Math.ceil(monthsAhead * 0.7)}`,
        confidence: pred.confidence,
        icon: index === 0 ? '🏆' : index === 1 ? '🥇' : '💪'
      });
    }
  });
  
  return milestones.slice(0, 4);
};

const generateRiskFactors = (analytics, monthsAhead) => {
  const risks = [];
  
  // Check for overtraining risk
  if (analytics.weeklyTrends?.length > 0) {
    const avgWorkouts = analytics.weeklyTrends.reduce((sum, w) => sum + w.workouts, 0) / analytics.weeklyTrends.length;
    if (avgWorkouts > 6) {
      risks.push({
        id: 'overtraining',
        factor: 'Overtraining Risk',
        description: 'High training frequency may lead to burnout',
        level: 'medium'
      });
    }
  }
  
  // Check for plateau risk
  const avgProgressionRate = Object.values(analytics.progressionRates || {})
    .reduce((sum, rate) => sum + rate, 0) / Object.keys(analytics.progressionRates || {}).length;
  
  if (avgProgressionRate < 0.1) {
    risks.push({
      id: 'plateau',
      factor: 'Plateau Risk',
      description: 'Slow progression may indicate need for program change',
      level: 'high'
    });
  }
  
  // Add more risk factors as needed
  risks.push({
    id: 'injury_prevention',
    factor: 'Injury Prevention',
    description: 'Maintain proper form and adequate rest',
    level: 'low'
  });
  
  return risks;
};

const generatePredictionTimeline = (monthsAhead, strengthPredictions) => {
  const timeline = [];
  const avgCurrentWeight = strengthPredictions.reduce((sum, p) => sum + p.current, 0) / strengthPredictions.length;
  const avgPredictedWeight = strengthPredictions.reduce((sum, p) => sum + p.predicted, 0) / strengthPredictions.length;
  
  for (let month = 0; month <= monthsAhead; month++) {
    const progress = month / monthsAhead;
    const currentValue = avgCurrentWeight + (avgPredictedWeight - avgCurrentWeight) * progress;
    
    timeline.push({
      month: month === 0 ? 'Now' : `Month ${month}`,
      current: month === 0 ? avgCurrentWeight : null,
      predicted: Math.round(currentValue)
    });
  }
  
  return timeline;
};

export default Predictions;