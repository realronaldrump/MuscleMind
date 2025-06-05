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
  SET_ANALYTICS_AND_PREDICTIONS: 'SET_ANALYTICS_AND_PREDICTIONS',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
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
    name: 'Fitness Enthusiast',
    age: 30,
    weight: 180,
    height: 70,
    experience: 'intermediate',
    goals: ['muscle_gain', 'strength'],
  },
  settings: {
    autoSave: true,
  },
};

// Reducer function
const workoutReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_DATA:
      return { 
        ...state, 
        rawData: action.payload.rawData,
        processedData: action.payload.processedData,
        loading: false 
      };
    
    case ACTIONS.SET_ANALYTICS_AND_PREDICTIONS:
      return { 
        ...state, 
        analytics: action.payload.analytics,
        predictions: action.payload.predictions,
        loading: false 
      };
    
    case ACTIONS.SET_USER_PROFILE:
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    
    case ACTIONS.UPDATE_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
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
      
      if (savedData) {
        const data = JSON.parse(savedData);
        const processedData = processWorkoutData(data);
        dispatch({ type: ACTIONS.SET_DATA, payload: { rawData: data, processedData } });
      }
      
      if (savedProfile) {
        dispatch({ type: ACTIONS.SET_USER_PROFILE, payload: JSON.parse(savedProfile) });
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

  // Process analytics and predictions when data or profile changes
  useEffect(() => {
    if (state.processedData.length > 0) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      try {
        const analytics = calculateAdvancedMetrics(state.processedData, state.userProfile);
        const predictions = generatePredictions(analytics, state.userProfile);
        
        dispatch({ 
          type: ACTIONS.SET_ANALYTICS_AND_PREDICTIONS, 
          payload: { analytics, predictions }
        });
      } catch (error) {
        console.error('Error processing analytics:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Error processing workout data' });
        toast.error('Failed to analyze data.');
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
          
          const processedData = processWorkoutData(results.data);
          dispatch({ type: ACTIONS.SET_DATA, payload: { rawData: results.data, processedData } });
          toast.success(`Successfully loaded ${results.data.length} records!`);
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

  const clearData = () => {
    localStorage.removeItem('musclemind_data');
    dispatch({ type: ACTIONS.SET_DATA, payload: { rawData: [], processedData: [] } });
    dispatch({ type: ACTIONS.SET_ANALYTICS_AND_PREDICTIONS, payload: { analytics: null, predictions: null } });
    toast.success('Data cleared successfully!');
  };

  const exportData = () => {
    try {
      const exportData = {
        userData: state.rawData,
        profile: state.userProfile,
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

  const value = {
    ...state,
    actions: {
      uploadWorkoutData,
      updateUserProfile,
      updateSettings,
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