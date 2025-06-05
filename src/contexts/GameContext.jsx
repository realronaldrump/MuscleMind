import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import confetti from 'react-confetti';

const GameContext = createContext();

// XP and level calculations
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
const calculateXPForLevel = (level) => Math.pow(level - 1, 2) * 100;
const calculateXPToNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  return nextLevelXP - xp;
};

// Achievement definitions
const achievementDefinitions = {
  // Milestone achievements
  first_workout: {
    id: 'first_workout',
    title: 'First Steps',
    description: 'Complete your first workout',
    icon: '🚀',
    xp: 50,
    type: 'milestone',
    rarity: 'common'
  },
  week_streak: {
    id: 'week_streak',
    title: 'Week Warrior',
    description: '7 day workout streak',
    icon: '🔥',
    xp: 200,
    type: 'streak',
    rarity: 'uncommon'
  },
  month_streak: {
    id: 'month_streak',
    title: 'Consistency King',
    description: '30 day workout streak',
    icon: '👑',
    xp: 1000,
    type: 'streak',
    rarity: 'rare'
  },
  volume_milestone_10k: {
    id: 'volume_milestone_10k',
    title: 'Volume Rookie',
    description: 'Reach 10,000 lbs total volume',
    icon: '💪',
    xp: 100,
    type: 'volume',
    rarity: 'common'
  },
  volume_milestone_100k: {
    id: 'volume_milestone_100k',
    title: 'Volume Beast',
    description: 'Reach 100,000 lbs total volume',
    icon: '🦍',
    xp: 500,
    type: 'volume',
    rarity: 'epic'
  },
  volume_milestone_1m: {
    id: 'volume_milestone_1m',
    title: 'Volume God',
    description: 'Reach 1,000,000 lbs total volume',
    icon: '⚡',
    xp: 2000,
    type: 'volume',
    rarity: 'legendary'
  },
  
  // Strength achievements
  bench_100: {
    id: 'bench_100',
    title: 'Century Club',
    description: 'Bench press 100+ lbs',
    icon: '🏋️',
    xp: 150,
    type: 'strength',
    rarity: 'uncommon'
  },
  deadlift_200: {
    id: 'deadlift_200',
    title: 'Heavy Lifter',
    description: 'Deadlift 200+ lbs',
    icon: '🔥',
    xp: 200,
    type: 'strength',
    rarity: 'uncommon'
  },
  squat_bodyweight: {
    id: 'squat_bodyweight',
    title: 'Bodyweight Warrior',
    description: 'Squat your bodyweight',
    icon: '⚖️',
    xp: 300,
    type: 'strength',
    rarity: 'rare'
  },
  
  // Special achievements
  perfect_form: {
    id: 'perfect_form',
    title: 'Form Master',
    description: 'Complete 50 exercises with perfect form',
    icon: '🎯',
    xp: 400,
    type: 'special',
    rarity: 'rare'
  },
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete 10 workouts before 7 AM',
    icon: '🌅',
    xp: 250,
    type: 'special',
    rarity: 'uncommon'
  },
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete 10 workouts after 9 PM',
    icon: '🦉',
    xp: 250,
    type: 'special',
    rarity: 'uncommon'
  },
  
  // Social achievements
  share_milestone: {
    id: 'share_milestone',
    title: 'Show Off',
    description: 'Share your first achievement',
    icon: '📱',
    xp: 100,
    type: 'social',
    rarity: 'common'
  }
};

// Challenge definitions
const challengeDefinitions = {
  daily_volume: {
    id: 'daily_volume',
    title: 'Daily Volume Challenge',
    description: 'Hit your daily volume target',
    duration: 'daily',
    xp: 50,
    icon: '📊'
  },
  consistency_week: {
    id: 'consistency_week',
    title: 'Weekly Consistency',
    description: 'Work out 5 times this week',
    duration: 'weekly',
    xp: 200,
    icon: '📅'
  },
  strength_gains: {
    id: 'strength_gains',
    title: 'Strength Gains',
    description: 'Increase weight on 3 exercises this week',
    duration: 'weekly',
    xp: 300,
    icon: '💪'
  },
  new_exercise: {
    id: 'new_exercise',
    title: 'Exercise Explorer',
    description: 'Try a new exercise',
    duration: 'daily',
    xp: 75,
    icon: '🔍'
  }
};

const initialGameState = {
  level: 1,
  xp: 0,
  totalXP: 0,
  achievements: [],
  unlockedAchievements: new Set(),
  activeChallenges: [],
  completedChallenges: [],
  streaks: {
    current: 0,
    longest: 0,
    lastWorkoutDate: null
  },
  stats: {
    totalWorkouts: 0,
    totalVolume: 0,
    avgWorkoutDuration: 0,
    favoriteExercise: '',
    strongestLift: '',
    weeklyGoal: 4,
    dailyVolumeGoal: 5000
  },
  preferences: {
    showLevelUps: true,
    showAchievements: true,
    soundEffects: true,
    celebrations: true,
    competitiveMode: false
  },
  leaderboard: {
    friends: [],
    global: [],
    rank: null
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(initialGameState);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load game state from localStorage
  useEffect(() => {
    const savedGameState = localStorage.getItem('musclemind_game_state');
    if (savedGameState) {
      const parsed = JSON.parse(savedGameState);
      setGameState({
        ...initialGameState,
        ...parsed,
        unlockedAchievements: new Set(parsed.unlockedAchievements || [])
      });
    }
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    const stateToSave = {
      ...gameState,
      unlockedAchievements: Array.from(gameState.unlockedAchievements)
    };
    localStorage.setItem('musclemind_game_state', JSON.stringify(stateToSave));
  }, [gameState]);

  // Add XP and check for level up
  const addXP = (amount, reason = '') => {
    setGameState(prev => {
      const newXP = prev.xp + amount;
      const newTotalXP = prev.totalXP + amount;
      const currentLevel = calculateLevel(prev.xp);
      const newLevel = calculateLevel(newXP);
      
      // Check for level up
      if (newLevel > currentLevel) {
        setShowLevelUp(true);
        setShowConfetti(true);
        setTimeout(() => {
          setShowLevelUp(false);
          setShowConfetti(false);
        }, 3000);
        
        if (gameState.preferences.soundEffects) {
          // Play level up sound
          playSound('levelup');
        }
        
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
      }
      
      if (reason) {
        toast.success(`+${amount} XP - ${reason}!`);
      }
      
      return {
        ...prev,
        xp: newXP,
        totalXP: newTotalXP,
        level: newLevel
      };
    });
  };

  // Unlock achievement
  const unlockAchievement = (achievementId) => {
    if (gameState.unlockedAchievements.has(achievementId)) {
      return; // Already unlocked
    }
    
    const achievement = achievementDefinitions[achievementId];
    if (!achievement) return;
    
    setGameState(prev => ({
      ...prev,
      achievements: [...prev.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
      unlockedAchievements: new Set([...prev.unlockedAchievements, achievementId])
    }));
    
    addXP(achievement.xp, `Achievement: ${achievement.title}`);
    setShowAchievement(achievement);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowAchievement(null);
      setShowConfetti(false);
    }, 4000);
    
    if (gameState.preferences.soundEffects) {
      playSound('achievement');
    }
  };

  // Check for achievements based on workout data
  const checkAchievements = (workoutData, analytics) => {
    if (!analytics) return;
    
    // Volume milestones
    if (analytics.totalVolume >= 10000 && !gameState.unlockedAchievements.has('volume_milestone_10k')) {
      unlockAchievement('volume_milestone_10k');
    }
    if (analytics.totalVolume >= 100000 && !gameState.unlockedAchievements.has('volume_milestone_100k')) {
      unlockAchievement('volume_milestone_100k');
    }
    if (analytics.totalVolume >= 1000000 && !gameState.unlockedAchievements.has('volume_milestone_1m')) {
      unlockAchievement('volume_milestone_1m');
    }
    
    // First workout
    if (analytics.totalWorkouts >= 1 && !gameState.unlockedAchievements.has('first_workout')) {
      unlockAchievement('first_workout');
    }
    
    // Streak achievements
    if (gameState.streaks.current >= 7 && !gameState.unlockedAchievements.has('week_streak')) {
      unlockAchievement('week_streak');
    }
    if (gameState.streaks.current >= 30 && !gameState.unlockedAchievements.has('month_streak')) {
      unlockAchievement('month_streak');
    }
    
    // Strength achievements
    if (analytics.strongestLifts) {
      analytics.strongestLifts.forEach(([exercise, weight]) => {
        if (exercise.toLowerCase().includes('bench') && weight >= 100 && !gameState.unlockedAchievements.has('bench_100')) {
          unlockAchievement('bench_100');
        }
        if (exercise.toLowerCase().includes('deadlift') && weight >= 200 && !gameState.unlockedAchievements.has('deadlift_200')) {
          unlockAchievement('deadlift_200');
        }
      });
    }
  };

  // Update streak
  const updateStreak = (workoutDate) => {
    const today = new Date(workoutDate).toDateString();
    const lastWorkout = gameState.streaks.lastWorkoutDate;
    
    if (!lastWorkout) {
      // First workout ever
      setGameState(prev => ({
        ...prev,
        streaks: {
          current: 1,
          longest: 1,
          lastWorkoutDate: today
        }
      }));
      return;
    }
    
    const lastDate = new Date(lastWorkout);
    const currentDate = new Date(workoutDate);
    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      setGameState(prev => ({
        ...prev,
        streaks: {
          ...prev.streaks,
          current: prev.streaks.current + 1,
          longest: Math.max(prev.streaks.longest, prev.streaks.current + 1),
          lastWorkoutDate: today
        }
      }));
    } else if (daysDiff > 1) {
      // Streak broken
      setGameState(prev => ({
        ...prev,
        streaks: {
          ...prev.streaks,
          current: 1,
          lastWorkoutDate: today
        }
      }));
    }
    // Same day = no change to streak
  };

  // Add challenge
  const addChallenge = (challengeId) => {
    const challenge = challengeDefinitions[challengeId];
    if (!challenge) return;
    
    const newChallenge = {
      ...challenge,
      id: `${challengeId}_${Date.now()}`,
      startDate: new Date().toISOString(),
      progress: 0,
      target: 1,
      completed: false
    };
    
    setGameState(prev => ({
      ...prev,
      activeChallenges: [...prev.activeChallenges, newChallenge]
    }));
  };

  // Complete challenge
  const completeChallenge = (challengeId) => {
    setGameState(prev => {
      const challenge = prev.activeChallenges.find(c => c.id === challengeId);
      if (!challenge) return prev;
      
      const completedChallenge = {
        ...challenge,
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      addXP(challenge.xp, `Challenge Complete: ${challenge.title}`);
      
      return {
        ...prev,
        activeChallenges: prev.activeChallenges.filter(c => c.id !== challengeId),
        completedChallenges: [...prev.completedChallenges, completedChallenge]
      };
    });
  };

  // Update preferences
  const updatePreferences = (newPrefs) => {
    setGameState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPrefs }
    }));
  };

  // Play sound effects
  const playSound = (type) => {
    if (!gameState.preferences.soundEffects) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    switch (type) {
      case 'levelup':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
      case 'achievement':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Get next level progress
  const getProgressToNextLevel = () => {
    const currentLevelXP = calculateXPForLevel(gameState.level);
    const nextLevelXP = calculateXPForLevel(gameState.level + 1);
    const progress = gameState.xp - currentLevelXP;
    const total = nextLevelXP - currentLevelXP;
    return Math.min(100, (progress / total) * 100);
  };

  const value = {
    ...gameState,
    showLevelUp,
    showAchievement,
    showConfetti,
    achievements: achievementDefinitions,
    challenges: challengeDefinitions,
    actions: {
      addXP,
      unlockAchievement,
      checkAchievements,
      updateStreak,
      addChallenge,
      completeChallenge,
      updatePreferences,
      getProgressToNextLevel,
      calculateXPToNextLevel: () => calculateXPToNextLevel(gameState.xp)
    }
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      
      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-3xl text-white text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2">LEVEL UP!</h2>
            <p className="text-2xl">Level {gameState.level}</p>
          </div>
        </div>
      )}
      
      {/* Achievement Modal */}
      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-8 rounded-3xl text-white text-center animate-pulse">
            <div className="text-6xl mb-4">{showAchievement.icon}</div>
            <h2 className="text-3xl font-bold mb-2">Achievement Unlocked!</h2>
            <h3 className="text-xl font-semibold mb-2">{showAchievement.title}</h3>
            <p className="text-lg">{showAchievement.description}</p>
            <p className="text-sm mt-2 opacity-80">+{showAchievement.xp} XP</p>
          </div>
        </div>
      )}
      
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="w-full h-full">
            {/* Simple confetti animation using CSS */}
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
      `}</style>
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;