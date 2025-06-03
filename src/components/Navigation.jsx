import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, BarChart3, Brain, Cube3D, Trophy, MessageSquare,
  Calendar, TrendingUp, Settings, User, Menu, X, Zap,
  Target, Star, Upload, Bell, Search
} from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const { rawData, userProfile, actions } = useWorkout();
  const { level, xp, actions: gameActions } = useGame();
  const { theme } = useTheme();

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Activity,
      description: 'Overview & AI Insights',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Deep Performance Analysis',
      color: 'from-purple-500 to-pink-500'
    },
    {
      path: '/predictions',
      label: 'Predictions',
      icon: Brain,
      description: 'AI Future Projections',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      path: '/3d-visualization',
      label: '3D Viz',
      icon: Cube3D,
      description: 'Interactive 3D Analysis',
      color: 'from-orange-500 to-red-500'
    },
    {
      path: '/gamification',
      label: 'Gaming',
      icon: Trophy,
      description: 'Achievements & Challenges',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      path: '/ai-coach',
      label: 'AI Coach',
      icon: MessageSquare,
      description: 'Personal Training Assistant',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      path: '/workout-planner',
      label: 'Planner',
      icon: Calendar,
      description: 'Smart Workout Planning',
      color: 'from-pink-500 to-rose-500'
    },
    {
      path: '/progress',
      label: 'Progress',
      icon: TrendingUp,
      description: 'Track Your Journey',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Generate notifications based on data
  useEffect(() => {
    const newNotifications = [];
    
    if (rawData.length === 0) {
      newNotifications.push({
        id: 'upload-data',
        type: 'info',
        title: 'Upload Your Data',
        message: 'Get started by uploading your Strong CSV file',
        action: 'Upload Now',
        icon: Upload
      });
    }
    
    if (level > 1 && gameActions.getProgressToNextLevel() > 80) {
      newNotifications.push({
        id: 'level-up-soon',
        type: 'success',
        title: 'Level Up Soon!',
        message: `Only ${gameActions.calculateXPToNextLevel()} XP to level ${level + 1}`,
        icon: Star
      });
    }
    
    setNotifications(newNotifications);
  }, [rawData, level, gameActions]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      actions.uploadWorkoutData(file);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40 flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MuscleMind Pro
              </h1>
              <p className="text-sm text-gray-400">AI Workout Analytics</p>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full p-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600/50 flex items-center space-x-3 hover:border-purple-500/50 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{userProfile.name || 'Set Profile'}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-purple-400">Level {level}</span>
                  <div className="flex-1 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${gameActions.getProgressToNextLevel()}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
            
            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl p-2 z-50"
                >
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} ${isActive ? 'shadow-lg' : 'opacity-80 group-hover:opacity-100'}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-gray-400">Total XP</p>
              <p className="text-lg font-bold text-purple-400">{xp.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-gray-400">Workouts</p>
              <p className="text-lg font-bold text-blue-400">{rawData.length > 0 ? new Set(rawData.map(r => r.Date)).size : 0}</p>
            </div>
          </div>
          
          {/* Upload Button */}
          {rawData.length === 0 && (
            <label className="mt-3 flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl cursor-pointer hover:scale-105 transition-transform">
              <Upload className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Upload Data</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 z-50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">MuscleMind</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            {notifications.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </motion.button>
            )}
            
            {/* Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="fixed top-16 left-0 right-0 bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 z-40 overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-screen overflow-y-auto">
                {/* User Profile */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{userProfile.name || 'Set Profile'}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-purple-400">Level {level}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                            : 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Upload Button */}
                {rawData.length === 0 && (
                  <label className="block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Upload Strong CSV</span>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Navigation;