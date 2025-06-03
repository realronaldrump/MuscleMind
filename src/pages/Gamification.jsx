import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, Flame, Zap, Crown, Award, Medal,
  Users, TrendingUp, Calendar, Clock, Shield, Sword,
  Gift, Sparkles, ChevronRight, Plus, Settings, Share2
} from 'lucide-react';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';
import { useWorkout } from '../contexts/WorkoutContext';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Gamification = () => {
  const { analytics } = useWorkout();
  const { 
    level, xp, totalXP, achievements, activeChallenges, completedChallenges,
    streaks, preferences, actions 
  } = useGame();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('achievements');
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Calculate level progress
  const levelProgress = actions.getProgressToNextLevel();
  const xpToNext = actions.calculateXPToNextLevel();

  // Achievement categories
  const achievementCategories = [
    { id: 'milestone', label: 'Milestones', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { id: 'streak', label: 'Streaks', icon: Flame, color: 'from-red-500 to-pink-500' },
    { id: 'volume', label: 'Volume', icon: Zap, color: 'from-purple-500 to-indigo-500' },
    { id: 'strength', label: 'Strength', icon: Shield, color: 'from-blue-500 to-cyan-500' },
    { id: 'special', label: 'Special', icon: Star, color: 'from-green-500 to-emerald-500' }
  ];

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Alex Chen', level: 47, xp: 125000, avatar: '👨‍💼', badge: 'Elite' },
    { rank: 2, name: 'Sarah Kim', level: 42, xp: 98000, avatar: '👩‍🚀', badge: 'Pro' },
    { rank: 3, name: 'Mike Johnson', level: 38, xp: 87000, avatar: '🧔', badge: 'Expert' },
    { rank: 4, name: 'You', level: level, xp: totalXP, avatar: '💪', badge: getLevelBadge(level) },
    { rank: 5, name: 'Emma Davis', level: 32, xp: 65000, avatar: '👩‍🦳', badge: 'Advanced' }
  ];

  // Active challenges data
  const challengeTypes = [
    {
      id: 'daily_volume',
      title: 'Daily Volume Challenge',
      description: 'Lift 5,000 lbs today',
      progress: 65,
      target: 100,
      reward: 150,
      timeLeft: '4h 23m',
      difficulty: 'Easy',
      icon: Target
    },
    {
      id: 'weekly_consistency',
      title: 'Weekly Warrior',
      description: 'Complete 5 workouts this week',
      progress: 80,
      target: 100,
      reward: 500,
      timeLeft: '2d 8h',
      difficulty: 'Medium',
      icon: Calendar
    },
    {
      id: 'strength_gains',
      title: 'Strength Surge',
      description: 'Increase weight on 3 exercises',
      progress: 33,
      target: 100,
      reward: 750,
      timeLeft: '5d 12h',
      difficulty: 'Hard',
      icon: TrendingUp
    }
  ];

  const tabs = [
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'rewards', label: 'Rewards', icon: Gift }
  ];

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
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Fitness Achievements
            </h1>
            <p className="text-gray-400">
              Level up your fitness journey with achievements, challenges, and rewards
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChallenge(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Challenge
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </motion.button>
          </div>
        </motion.div>

        {/* Player Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 backdrop-blur-xl border border-purple-500/20 rounded-3xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Level Progress */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#levelGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - levelProgress / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{level}</p>
                    <p className="text-xs text-purple-300">LEVEL</p>
                  </div>
                </div>
              </div>
              <p className="text-white font-semibold mb-1">Level {level}</p>
              <p className="text-purple-300 text-sm">{xpToNext} XP to next level</p>
            </div>

            {/* XP Stats */}
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-400">{xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Current XP</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-green-400">{totalXP.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Total XP</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-blue-400">{achievements.length}</p>
                <p className="text-xs text-gray-400">Achievements Unlocked</p>
              </div>
            </div>

            {/* Streaks */}
            <div className="text-center">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="w-8 h-8 text-orange-400 mr-2" />
                  <span className="text-3xl font-bold text-white">{streaks.current}</span>
                </div>
                <p className="text-orange-300 text-sm">Current Streak</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-lg font-bold text-red-400">{streaks.longest}</p>
                  <p className="text-xs text-gray-400">Best Streak</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-lg font-bold text-purple-400">{getLevelBadge(level)}</p>
                  <p className="text-xs text-gray-400">Rank</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Achievement Categories */}
              <div className="flex flex-wrap gap-4 mb-6">
                {achievementCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center px-4 py-2 bg-gradient-to-r ${category.color} rounded-xl text-white cursor-pointer`}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </motion.div>
                ))}
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                      achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30' :
                      achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30' :
                      achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30' :
                      'bg-slate-800/50 border-slate-700/50'
                    } hover:border-purple-500/50`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          achievement.rarity === 'legendary' ? 'bg-yellow-500 text-black' :
                          achievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
                          achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {achievement.rarity}
                        </div>
                        <span className="text-yellow-400 font-bold">+{achievement.xp}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{achievement.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Unlocked</span>
                      <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Locked Achievements Preview */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`locked-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (achievements.length + i) * 0.1 }}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Locked</p>
                      </div>
                    </div>
                    
                    <div className="blur-sm">
                      <div className="text-4xl mb-4">🏆</div>
                      <h3 className="text-lg font-bold text-white mb-2">Hidden Achievement</h3>
                      <p className="text-gray-400 text-sm">Complete more workouts to unlock</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Active Challenges */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Active Challenges</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {challengeTypes.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                            <challenge.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                            <p className="text-gray-400 text-sm">{challenge.description}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">+{challenge.reward} XP</p>
                          <p className="text-gray-400 text-xs">{challenge.timeLeft}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {challenge.difficulty}
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          View Details →
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Completed Challenges */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recently Completed</h2>
                <div className="space-y-3">
                  {completedChallenges.slice(-3).map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{challenge.title}</p>
                          <p className="text-gray-400 text-sm">Completed {challenge.completedAt}</p>
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">+{challenge.xp} XP</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                  Global Leaderboard
                </h2>

                <div className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                        player.name === 'You' 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                          : 'bg-slate-700/50 hover:bg-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1 ? 'bg-yellow-500 text-black' :
                          player.rank === 2 ? 'bg-gray-300 text-black' :
                          player.rank === 3 ? 'bg-orange-400 text-black' :
                          'bg-slate-600 text-white'
                        }`}>
                          {player.rank}
                        </div>
                        
                        <div className="text-2xl">{player.avatar}</div>
                        
                        <div>
                          <p className={`font-semibold ${player.name === 'You' ? 'text-purple-300' : 'text-white'}`}>
                            {player.name}
                          </p>
                          <p className="text-gray-400 text-sm">Level {player.level}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold">{player.xp.toLocaleString()} XP</p>
                        <p className={`text-xs px-2 py-1 rounded ${
                          player.badge === 'Elite' ? 'bg-yellow-500 text-black' :
                          player.badge === 'Pro' ? 'bg-purple-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {player.badge}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-20">
                <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Rewards Coming Soon</h2>
                <p className="text-gray-400">Unlock exclusive rewards, badges, and customizations.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center"
              >
                <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedAchievement.title}</h2>
                <p className="text-gray-400 mb-4">{selectedAchievement.description}</p>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedAchievement.rarity === 'legendary' ? 'bg-yellow-500 text-black' :
                    selectedAchievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
                    selectedAchievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {selectedAchievement.rarity}
                  </div>
                  <span className="text-yellow-400 font-bold">+{selectedAchievement.xp} XP</span>
                </div>
                <p className="text-gray-500 text-sm">
                  Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper function to get level badge
function getLevelBadge(level) {
  if (level >= 50) return 'Elite';
  if (level >= 30) return 'Pro';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Advanced';
  return 'Beginner';
}

export default Gamification;