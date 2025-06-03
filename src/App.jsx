import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import ParticleBackground from './components/ParticleBackground';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Predictions = lazy(() => import('./pages/Predictions'));
const ThreeDVisualization = lazy(() => import('./pages/ThreeDVisualization'));
const Gamification = lazy(() => import('./pages/Gamification'));
const AICoach = lazy(() => import('./pages/AICoach'));
const SocialHub = lazy(() => import('./pages/SocialHub'));
const Settings = lazy(() => import('./pages/Settings'));
const WorkoutPlanner = lazy(() => import('./pages/WorkoutPlanner'));
const ProgressTracker = lazy(() => import('./pages/ProgressTracker'));

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WorkoutProvider>
          <GameProvider>
            <div className="min-h-screen bg-slate-900 relative overflow-hidden">
              {/* Animated background */}
              <ParticleBackground />
              
              {/* Navigation */}
              <Navigation />
              
              {/* Main content */}
              <main className="relative z-10">
                <AnimatePresence mode="wait">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Dashboard />
                        </motion.div>
                      } />
                      
                      <Route path="/analytics" element={
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Analytics />
                        </motion.div>
                      } />
                      
                      <Route path="/predictions" element={
                        <motion.div
                          initial={{ opacity: 0, rotateX: -10 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                          exit={{ opacity: 0, rotateX: 10 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Predictions />
                        </motion.div>
                      } />
                      
                      <Route path="/3d-visualization" element={
                        <motion.div
                          initial={{ opacity: 0, z: -100 }}
                          animate={{ opacity: 1, z: 0 }}
                          exit={{ opacity: 0, z: 100 }}
                          transition={{ duration: 0.5 }}
                        >
                          <ThreeDVisualization />
                        </motion.div>
                      } />
                      
                      <Route path="/gamification" element={
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          transition={{ duration: 0.4, type: "spring" }}
                        >
                          <Gamification />
                        </motion.div>
                      } />
                      
                      <Route path="/ai-coach" element={
                        <motion.div
                          initial={{ opacity: 0, rotateY: 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -90 }}
                          transition={{ duration: 0.5 }}
                        >
                          <AICoach />
                        </motion.div>
                      } />
                      
                      <Route path="/social" element={
                        <motion.div
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SocialHub />
                        </motion.div>
                      } />
                      
                      <Route path="/workout-planner" element={
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          transition={{ duration: 0.4 }}
                        >
                          <WorkoutPlanner />
                        </motion.div>
                      } />
                      
                      <Route path="/progress" element={
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ProgressTracker />
                        </motion.div>
                      } />
                      
                      <Route path="/settings" element={
                        <motion.div
                          initial={{ opacity: 0, rotateX: 20 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                          exit={{ opacity: 0, rotateX: -20 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Settings />
                        </motion.div>
                      } />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </main>
            </div>
          </GameProvider>
        </WorkoutProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;