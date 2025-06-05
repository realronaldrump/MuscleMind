import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, HeartPulse, GitBranch, Info, Brain } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { getExerciseHistory, getExerciseMaxWeightHistory } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import DrillDownModal from '../components/DrillDownModal';

const Predictions = () => {
  const { predictions, loading, analytics, processedData } = useWorkout();
  const [selectedTimeframe, setSelectedTimeframe] = useState(3);
  const [modalContent, setModalContent] = useState(null);

  const timeframes = [
    { months: 3, label: '3 Months' },
    { months: 6, label: '6 Months' },
    { months: 12, label: '1 Year' },
  ];

  const topStrengthPredictions = useMemo(() => {
    if (!predictions?.strengthProjections) return [];
    return Object.values(predictions.strengthProjections)
      .sort((a, b) => b.currentE1RM - a.currentE1RM)
      .slice(0, 6);
  }, [predictions]);

  const handleOpenModal = (prediction) => {
    if (!prediction) return;

    const timeframeData = prediction.timeframes.find(t => t.months === selectedTimeframe);
    const e1rmHistory = getExerciseHistory(prediction.name, processedData);
    const maxWeightHistory = getExerciseMaxWeightHistory(prediction.name, processedData);

    setModalContent({
      icon: Zap,
      title: `Projection: ${prediction.name}`,
      sections: [
        {
          subtitle: 'What it means',
          text: `This card predicts your future strength for the ${prediction.name}, measured in Estimated 1-Rep Max (E1RM). E1RM is the maximum weight you could likely lift for a single repetition.`
        },
        {
          subtitle: 'How it was calculated',
          text: `1. We analyzed your historical performance for this exercise to find your statistical trend.\n2. Your weekly E1RM gain is calculated to be ~${prediction.progression.weeklyE1RMGain.toFixed(1)} lbs (with ${Math.round(prediction.progression.confidence * 100)}% confidence).\n3. We project this trend forward, applying a diminishing returns factor of ${prediction.diminishingFactor.toFixed(2)}x to account for the fact that gains slow down over time.\n4. The "Range" is a 95% confidence interval based on the consistency of your past progression.`
        },
        {
          subtitle: 'Your Historical E1RM',
          text: `Historical E1RM for ${prediction.name}:`,
          chartData: e1rmHistory,
          chartKey: 'value'
        },
        {
          subtitle: 'Your Max Weight History',
          text: `Historical max weight for ${prediction.name}:`,
          chartData: maxWeightHistory,
          chartKey: 'value'
        },
        {
          subtitle: 'AI Recommendations',
          text: `• To beat this projection, focus on consistent overload. Try increasing weight by 2-5% when you can complete all sets and reps with good form.\n• Consider varying your rep ranges (e.g., 3-5 for strength, 8-12 for hypertrophy) to break through plateaus.\n• Ensure you're getting adequate rest for the ${prediction.progression.muscleGroup} muscle group.`
        }
      ]
    });
  };

  const handleOpenHypertrophyModal = () => {
    const { hypertrophyPotential } = predictions;
    setModalContent({
      icon: HeartPulse,
      title: 'Hypertrophy Potential Analysis',
      sections: [
        {
          subtitle: 'What it means',
          text: 'This score estimates how effective your current training is for stimulating muscle growth (hypertrophy). It combines key scientific principles: volume, progressive overload, and muscle balance.'
        },
        {
          subtitle: 'How it was calculated',
          component: (
            <div className="space-y-2 text-sm text-gray-300">
              <p>• <b className="text-white">Volume ({hypertrophyPotential.scores.volume}/100):</b> Based on your average weekly volume of ${hypertrophyPotential.details.avgWeeklyVolume.toLocaleString()} lbs, compared to optimal ranges from research.</p>
              <p>• <b className="text-white">Progression ({hypertrophyPotential.scores.progression}/100):</b> Measures if your volume is consistently increasing over time. Your current trend is a change of ${hypertrophyPotential.details.volumeTrend} lbs/week.</p>
              <p>• <b className="text-white">Balance ({hypertrophyPotential.scores.balance}/100):</b> Analyzes the distribution of volume across all muscle groups to ensure balanced development and reduce injury risk.</p>
            </div>
          )
        },
        {
          subtitle: 'AI Recommendations',
          text: hypertrophyPotential.recommendations.map(r => `• ${r}`).join('\n')
        }
      ]
    });
  };

  const handleOpenReadinessModal = () => {
    const lastState = analytics.fitnessFatigue[analytics.fitnessFatigue.length - 1];
    setModalContent({
      icon: GitBranch,
      title: 'Readiness & Fatigue Model',
      sections: [
        {
          subtitle: 'What it means',
          text: 'This model visualizes the balance between your fitness and fatigue.\n\n• Fitness (CTL): Your long-term, accumulated fitness (42-day average).\n• Fatigue (ATL): Your short-term fatigue from recent workouts (7-day average).\n• Readiness (TSB): The key metric. It\'s your Fitness minus Fatigue. A positive value means you\'re fresh; a negative value means you\'re fatigued.'
        },
        {
          subtitle: 'How it was calculated',
          text: `Each workout generates a Training Stress Score (TSS). These scores are used in an exponentially-weighted moving average to calculate your Fitness and Fatigue over time. Your current values are:\n\n• Fitness (CTL): ${lastState.ctl.toFixed(1)}\n• Fatigue (ATL): ${lastState.atl.toFixed(1)}\n• Readiness (TSB): ${lastState.tsb.toFixed(1)}`
        },
        {
          subtitle: 'AI Recommendations',
          text: '• Aim for peak performance when Readiness (blue line) is positive and rising.\n• Plan recovery or deload weeks when Fatigue (red line) is significantly higher than Fitness (purple line).\n• A steady, long-term rise in your Fitness line is the primary goal for consistent progress.'
        }
      ]
    });
  };

  if (loading) {
    return <LoadingSpinner message="Recalibrating neural pathways..." />;
  }

  if (!predictions || !analytics) {
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
    <>
      <DrillDownModal isOpen={!!modalContent} onClose={() => setModalContent(null)} content={modalContent} />
      <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              AI Projections
            </h1>
            <p className="text-gray-400">
              Your fitness future, calculated from your unique training data.
            </p>
          </motion.div>

          {/* Timeframe Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-4">
            {timeframes.map((timeframe) => (
              <motion.button key={timeframe.months} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTimeframe(timeframe.months)} className={`px-6 py-3 rounded-xl transition-all ${selectedTimeframe === timeframe.months ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-purple-500/30'}`}>
                <p className="font-semibold">{timeframe.label}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* Strength Predictions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center"><Zap className="w-6 h-6 text-yellow-400 mr-3" />Strength Projections</h2>
            <p className="text-gray-400 mb-6">Predicted Estimated 1-Rep Max (E1RM) in {selectedTimeframe} months.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topStrengthPredictions.map((pred, index) => {
                const timeframeData = pred.timeframes.find(t => t.months === selectedTimeframe);
                if (!timeframeData) return null;
                return (
                  <motion.div key={pred.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.05 }} onClick={() => handleOpenModal(pred)} className="p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl hover:border-purple-500/50 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white text-sm truncate mb-3 pr-2">{pred.name}</h3>
                      <Info className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                    </div>
                    <div className="flex justify-between items-center text-sm mb-1"><span className="text-gray-400">Current</span><span className="text-white font-semibold">{pred.currentE1RM} lbs</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-purple-400">Predicted</span><span className="text-purple-400 font-bold">{timeframeData.predictedE1RM} lbs</span></div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${(pred.currentE1RM / timeframeData.predictedE1RM) * 100}%` }}></div></div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Hypertrophy & Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} onClick={handleOpenHypertrophyModal} className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl group cursor-pointer hover:border-red-500/50 transition-colors">
              <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-white mb-4 flex items-center"><HeartPulse className="w-6 h-6 text-red-400 mr-2" />Hypertrophy Potential</h3><Info className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" /></div>
              <div className="text-center mb-4"><div className="text-5xl font-bold text-red-400">{predictions.hypertrophyPotential.overallScore}<span className="text-3xl text-gray-400">/100</span></div><p className="text-gray-400 text-sm">Your current training effectiveness for muscle growth.</p></div>
              <div className="space-y-3"><div className="flex justify-between text-sm mb-1"><span className="capitalize text-gray-300">Volume</span><span className="text-white">{predictions.hypertrophyPotential.scores.volume}/100</span></div><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: `${predictions.hypertrophyPotential.scores.volume}%`}}></div></div><div className="flex justify-between text-sm mb-1"><span className="capitalize text-gray-300">Progression</span><span className="text-white">{predictions.hypertrophyPotential.scores.progression}/100</span></div><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: `${predictions.hypertrophyPotential.scores.progression}%`}}></div></div><div className="flex justify-between text-sm mb-1"><span className="capitalize text-gray-300">Balance</span><span className="text-white">{predictions.hypertrophyPotential.scores.balance}/100</span></div><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: `${predictions.hypertrophyPotential.scores.balance}%`}}></div></div></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} onClick={handleOpenReadinessModal} className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl group cursor-pointer hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-white mb-4 flex items-center"><GitBranch className="w-6 h-6 text-blue-400 mr-2" />Projected Readiness</h3><Info className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" /></div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={predictions.futureReadiness}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} label={{ value: 'Days from now', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff' }} />
                  <defs><linearGradient id="tsbFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                  <Line type="monotone" dataKey="ctl" stroke="#8b5cf6" strokeWidth={2} name="Fitness" dot={false} />
                  <Line type="monotone" dataKey="atl" stroke="#ef4444" strokeWidth={2} name="Fatigue" dot={false} />
                  <Area type="monotone" dataKey="tsb" fill="url(#tsbFill)" stroke="#06b6d4" strokeWidth={2} name="Readiness" />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Predictions;