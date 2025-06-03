import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Target, Clock, Zap, Save, Play } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { toast } from 'react-hot-toast';

const WorkoutPlanner = () => {
  const { analytics } = useWorkout();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [workout, setWorkout] = useState({
    name: '',
    exercises: [],
    duration: 60,
    focusArea: 'full-body'
  });

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: 10,
    weight: 0
  });

  const focusAreas = [
    { id: 'chest', label: 'Chest', icon: '💪' },
    { id: 'back', label: 'Back', icon: '🔥' },
    { id: 'legs', label: 'Legs', icon: '🦵' },
    { id: 'shoulders', label: 'Shoulders', icon: '💥' },
    { id: 'arms', label: 'Arms', icon: '💪' },
    { id: 'full-body', label: 'Full Body', icon: '🎯' }
  ];

  const suggestedExercises = {
    chest: ['Bench Press', 'Chest Fly', 'Push-ups', 'Incline Press'],
    back: ['Lat Pulldown', 'Seated Row', 'Pull-ups', 'Deadlift'],
    legs: ['Squat', 'Leg Press', 'Leg Curl', 'Calf Raises'],
    shoulders: ['Shoulder Press', 'Lateral Raises', 'Rear Delt Fly'],
    arms: ['Bicep Curl', 'Tricep Extension', 'Hammer Curl'],
    'full-body': ['Deadlift', 'Squat', 'Pull-ups', 'Push-ups']
  };

  const addExercise = () => {
    if (!newExercise.name) {
      toast.error('Please enter exercise name');
      return;
    }
    
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise, id: Date.now() }]
    }));
    
    setNewExercise({ name: '', sets: 3, reps: 10, weight: 0 });
    toast.success('Exercise added!');
  };

  const removeExercise = (id) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const saveWorkout = () => {
    if (!workout.name || workout.exercises.length === 0) {
      toast.error('Please add workout name and exercises');
      return;
    }
    
    toast.success('Workout plan saved!');
  };

  return (
    <div className="min-h-screen lg:ml-80 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Workout Planner</h1>
          <p className="text-gray-400">Plan your next workout session</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workout Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workout Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <h2 className="text-xl font-bold text-white mb-4">Workout Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Workout Name</label>
                  <input
                    type="text"
                    value={workout.name}
                    onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Morning Push Day"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={workout.duration}
                    onChange={(e) => setWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Focus Area</label>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <motion.button
                      key={area.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setWorkout(prev => ({ ...prev, focusArea: area.id }))}
                      className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                        workout.focusArea === area.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="mr-2">{area.icon}</span>
                      {area.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Add Exercise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Exercise</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Exercise name"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Sets"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Reps"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {suggestedExercises[workout.focusArea]?.slice(0, 4).map((exercise) => (
                    <motion.button
                      key={exercise}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setNewExercise(prev => ({ ...prev, name: exercise }))}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all"
                    >
                      {exercise}
                    </motion.button>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addExercise}
                  className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </motion.button>
              </div>
            </motion.div>

            {/* Exercise List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <h2 className="text-xl font-bold text-white mb-4">Exercises ({workout.exercises.length})</h2>
              {workout.exercises.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No exercises added yet</p>
              ) : (
                <div className="space-y-3">
                  {workout.exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{exercise.name}</p>
                          <p className="text-gray-400 text-sm">{exercise.sets} sets × {exercise.reps} reps</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <h3 className="text-lg font-bold text-white mb-4">Workout Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Exercises</span>
                  <span className="text-white font-bold">{workout.exercises.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sets</span>
                  <span className="text-white font-bold">
                    {workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Duration</span>
                  <span className="text-white font-bold">{workout.duration}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus</span>
                  <span className="text-white font-bold capitalize">{workout.focusArea}</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveWorkout}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Workout
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Workout
              </motion.button>
            </motion.div>

            {/* Recent Workouts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
            >
              <h3 className="text-lg font-bold text-white mb-4">Recent Templates</h3>
              <div className="space-y-2">
                {['Push Day', 'Pull Day', 'Leg Day'].map((template, index) => (
                  <motion.button
                    key={template}
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-all"
                  >
                    {template}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;