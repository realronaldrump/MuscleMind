import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Bell, Palette, Download, 
  Trash2, Shield, Moon, Sun, Volume2, VolumeX
} from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { userProfile, actions } = useWorkout();
  const { currentTheme, themes, actions: themeActions } = useTheme();
  const { preferences, actions: gameActions } = useGame();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Download }
  ];

  const handleProfileUpdate = (field, value) => {
    actions.updateUserProfile({ [field]: value });
  };

  const handleThemeChange = (themeName) => {
    themeActions.changeTheme(themeName);
  };

  const handleGamePrefsUpdate = (field, value) => {
    gameActions.updatePreferences({ [field]: value });
  };

  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your MuscleMind experience</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <section.icon className="w-5 h-5 mr-3" />
                {section.label}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={userProfile.name || ''}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                      <input
                        type="number"
                        value={userProfile.age || ''}
                        onChange={(e) => handleProfileUpdate('age', parseInt(e.target.value))}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Weight (lbs)</label>
                      <input
                        type="number"
                        value={userProfile.weight || ''}
                        onChange={(e) => handleProfileUpdate('weight', parseInt(e.target.value))}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                      <select
                        value={userProfile.experience || 'beginner'}
                        onChange={(e) => handleProfileUpdate('experience', e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Theme</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(themes).map(([themeId, theme]) => (
                      <motion.button
                        key={themeId}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleThemeChange(themeId)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          currentTheme === themeId ? 'border-purple-500' : 'border-slate-600'
                        }`}
                        style={{ background: theme.background }}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: theme.primary }} />
                          <p className="text-white font-medium">{theme.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'showLevelUps', label: 'Level Up Notifications' },
                      { key: 'showAchievements', label: 'Achievement Unlocks' },
                      { key: 'soundEffects', label: 'Sound Effects' },
                      { key: 'celebrations', label: 'Celebration Animations' }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between">
                        <span className="text-white">{pref.label}</span>
                        <button
                          onClick={() => handleGamePrefsUpdate(pref.key, !preferences[pref.key])}
                          className={`w-12 h-6 rounded-full transition-all ${
                            preferences[pref.key] ? 'bg-purple-500' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences[pref.key] ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'data' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={actions.exportData}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Export All Data
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all data?')) {
                          actions.clearData();
                        }
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Clear All Data
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;