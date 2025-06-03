import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';
import { 
  processWorkoutData, 
  calculateAdvancedMetrics, 
  generatePredictions
} from '../utils/dataProcessing';

const WorkoutContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DATA: 'SET_DATA',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_PREDICTIONS: 'SET_PREDICTIONS',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  ADD_WORKOUT: 'ADD_WORKOUT',
  UPDATE_GOALS: 'UPDATE_GOALS'
};

// Initial state
const initialState = {
  rawData: [],
  processedData: [],
  analytics: null,
  predictions: null,
  loading: false,
  error: null,
  userProfile: {
    name: '',
    age: null,
    weight: null,
    height: null,
    experience: 'beginner',
    goals: ['muscle_gain'],
    preferences: {
      units: 'imperial',
      theme: 'dark',
      notifications: true,
      privacy: 'private'
    }
  },
  achievements: [],
  settings: {
    autoSave: true,
    dataRetention: 90,
    analyticsLevel: 'advanced',
    shareData: false
  },
  filters: {
    dateRange: null,
    exercises: [],
    muscleGroups: []
  },
  goals: {
    strength: {},
    volume: {},
    consistency: {}
  }
};

// Reducer function
const workoutReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_DATA:
      return { 
        ...state, 
        rawData: action.payload, 
        processedData: processWorkoutData(action.payload),
        loading: false 
      };
    
    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload };
    
    case ACTIONS.SET_PREDICTIONS:
      return { ...state, predictions: action.payload };
    
    case ACTIONS.SET_USER_PROFILE:
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    
    case ACTIONS.ADD_ACHIEVEMENT:
      return { 
        ...state, 
        achievements: [...state.achievements, action.payload] 
      };
    
    case ACTIONS.UPDATE_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ACTIONS.ADD_WORKOUT:
      return { 
        ...state, 
        rawData: [...state.rawData, ...action.payload],
        processedData: processWorkoutData([...state.rawData, ...action.payload])
      };
    
    case ACTIONS.UPDATE_GOALS:
      return { ...state, goals: { ...state.goals, ...action.payload } };
    
    default:
      return state;
  }
};

// Provider component
export const WorkoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('musclemind_data');
      const savedProfile = localStorage.getItem('musclemind_profile');
      const savedSettings = localStorage.getItem('musclemind_settings');
      const savedAchievements = localStorage.getItem('musclemind_achievements');
      
      if (savedData) {
        const data = JSON.parse(savedData);
        dispatch({ type: ACTIONS.SET_DATA, payload: data });
      }
      
      if (savedProfile) {
        dispatch({ type: ACTIONS.SET_USER_PROFILE, payload: JSON.parse(savedProfile) });
      }
      
      if (savedSettings) {
        dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: JSON.parse(savedSettings) });
      }
      
      if (savedAchievements) {
        const achievements = JSON.parse(savedAchievements);
        achievements.forEach(achievement => {
          dispatch({ type: ACTIONS.ADD_ACHIEVEMENT, payload: achievement });
        });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      toast.error('Error loading saved data');
    }
  }, []);

  // Auto-save data when it changes
  useEffect(() => {
    if (state.rawData.length > 0 && state.settings.autoSave) {
      localStorage.setItem('musclemind_data', JSON.stringify(state.rawData));
    }
  }, [state.rawData, state.settings.autoSave]);

  // Save user profile
  useEffect(() => {
    localStorage.setItem('musclemind_profile', JSON.stringify(state.userProfile));
  }, [state.userProfile]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('musclemind_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Save achievements
  useEffect(() => {
    localStorage.setItem('musclemind_achievements', JSON.stringify(state.achievements));
  }, [state.achievements]);

  // Process analytics when data changes
  useEffect(() => {
    if (state.processedData.length > 0) {
      try {
        const analytics = calculateAdvancedMetrics(state.processedData, state.userProfile);
        dispatch({ type: ACTIONS.SET_ANALYTICS, payload: analytics });
        
        const predictions = generatePredictions(state.processedData, analytics, state.userProfile);
        dispatch({ type: ACTIONS.SET_PREDICTIONS, payload: predictions });
        
        // Check for new achievements
        checkAchievements(analytics, state.achievements);
      } catch (error) {
        console.error('Error processing analytics:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Error processing workout data' });
      }
    }
  }, [state.processedData, state.userProfile]);

  // Action creators
  const uploadWorkoutData = async (file) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    
    try {
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            throw new Error('CSV parsing error: ' + results.errors[0].message);
          }
          
          dispatch({ type: ACTIONS.SET_DATA, payload: results.data });
          toast.success(`Successfully loaded ${results.data.length} workout records!`);
        },
        error: (error) => {
          throw new Error('Failed to parse CSV: ' + error.message);
        }
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error(error.message);
    }
  };

  const updateUserProfile = (updates) => {
    dispatch({ type: ACTIONS.SET_USER_PROFILE, payload: updates });
    toast.success('Profile updated successfully!');
  };

  const updateSettings = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: updates });
    toast.success('Settings updated!');
  };

  const addWorkout = (workoutData) => {
    dispatch({ type: ACTIONS.ADD_WORKOUT, payload: workoutData });
    toast.success('Workout added successfully!');
  };

  const setFilters = (filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
  };

  const updateGoals = (goals) => {
    dispatch({ type: ACTIONS.UPDATE_GOALS, payload: goals });
    toast.success('Goals updated!');
  };

  const clearData = () => {
    localStorage.removeItem('musclemind_data');
    localStorage.removeItem('musclemind_analytics');
    dispatch({ type: ACTIONS.SET_DATA, payload: [] });
    toast.success('Data cleared successfully!');
  };

  const exportData = () => {
    try {
      const exportData = {
        userData: state.rawData,
        profile: state.userProfile,
        achievements: state.achievements,
        settings: state.settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `musclemind-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const checkAchievements = (analytics, currentAchievements) => {
    if (!analytics) return;
    
    const achievements = [];
    const achievementIds = new Set(currentAchievements.map(a => a.id));
    
    // Check various achievement conditions
    if (analytics.totalWorkouts >= 10 && !achievementIds.has('first_ten')) {
      achievements.push({
        id: 'first_ten',
        title: 'Getting Started',
        description: 'Completed 10 workouts',
        type: 'milestone',
        date: new Date().toISOString(),
        rarity: 'common'
      });
    }
    
    if (analytics.totalVolume >= 100000 && !achievementIds.has('volume_milestone')) {
      achievements.push({
        id: 'volume_milestone',
        title: 'Volume Beast',
        description: 'Reached 100K lbs total volume',
        type: 'milestone',
        date: new Date().toISOString(),
        rarity: 'rare'
      });
    }
    
    // Add achievements
    achievements.forEach(achievement => {
      dispatch({ type: ACTIONS.ADD_ACHIEVEMENT, payload: achievement });
      toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`);
    });
  };

  const value = {
    ...state,
    actions: {
      uploadWorkoutData,
      updateUserProfile,
      updateSettings,
      addWorkout,
      setFilters,
      updateGoals,
      clearData,
      exportData
    }
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export default WorkoutContext;