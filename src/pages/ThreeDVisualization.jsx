import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Cone, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cube, RotateCcw, Maximize2, Download, Settings, Play, Pause,
  ZoomIn, ZoomOut, RotateCw, Eye, EyeOff, Layers, Palette
} from 'lucide-react';
import * as THREE from 'three';
import { useWorkout } from '../contexts/WorkoutContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ThreeDVisualization = () => {
  const { analytics, rawData, loading } = useWorkout();
  const { theme } = useTheme();
  const [visualizationType, setVisualizationType] = useState('volume_bars');
  const [isAnimating, setIsAnimating] = useState(true);
  const [cameraPosition, setCameraPosition] = useState([10, 10, 10]);
  const [showControls, setShowControls] = useState(true);
  const [colorScheme, setColorScheme] = useState('gradient');

  // 3D Data Processing
  const threeDData = useMemo(() => {
    if (!analytics) return {};

    const exerciseStats = analytics.exerciseStats || {};
    const muscleGroups = analytics.muscleGroups || {};
    const volumeOverTime = analytics.volumeOverTime || [];

    // Volume bars data
    const volumeBars = Object.entries(exerciseStats)
      .slice(0, 12)
      .map(([exercise, stats], index) => ({
        id: exercise,
        name: exercise.substring(0, 15),
        volume: stats.totalVolume,
        height: Math.max(0.5, (stats.totalVolume / 10000)),
        position: [
          (index % 4) * 3 - 4.5,
          0,
          Math.floor(index / 4) * 3 - 3
        ],
        color: `hsl(${(index * 30) % 360}, 70%, 60%)`
      }));

    // Muscle group spheres
    const muscleGroupSpheres = Object.entries(muscleGroups)
      .map(([group, data], index) => ({
        id: group,
        name: group,
        volume: data.totalVolume,
        radius: Math.max(0.3, Math.min(2, data.totalVolume / 50000)),
        position: [
          Math.cos(index * (Math.PI * 2) / Object.keys(muscleGroups).length) * 5,
          0,
          Math.sin(index * (Math.PI * 2) / Object.keys(muscleGroups).length) * 5
        ],
        color: `hsl(${(index * 60) % 360}, 70%, 60%)`
      }));

    // Progress timeline (3D line chart)
    const progressTimeline = volumeOverTime.slice(-20).map((data, index) => ({
      position: [index * 0.5 - 5, data.volume / 10000, 0],
      volume: data.volume,
      date: data.date
    }));

    // Strength mountain (3D surface)
    const strengthMountain = Object.entries(exerciseStats)
      .slice(0, 25)
      .map(([exercise, stats], index) => ({
        id: exercise,
        position: [
          (index % 5) * 2 - 4,
          stats.maxWeight / 50,
          Math.floor(index / 5) * 2 - 4
        ],
        height: stats.maxWeight / 50,
        progression: stats.progressionRate || 0
      }));

    return {
      volumeBars,
      muscleGroupSpheres,
      progressTimeline,
      strengthMountain
    };
  }, [analytics]);

  const visualizationTypes = [
    { id: 'volume_bars', label: '3D Volume Bars', icon: Cube },
    { id: 'muscle_spheres', label: 'Muscle Group Spheres', icon: Sphere },
    { id: 'progress_timeline', label: 'Progress Timeline', icon: TrendingUp },
    { id: 'strength_mountain', label: 'Strength Mountain', icon: Mountain }
  ];

  const colorSchemes = [
    { id: 'gradient', label: 'Gradient', colors: ['#8b5cf6', '#06b6d4', '#10b981'] },
    { id: 'neon', label: 'Neon', colors: ['#ff00ff', '#00ffff', '#ffff00'] },
    { id: 'fire', label: 'Fire', colors: ['#ff4500', '#ff6347', '#ffd700'] },
    { id: 'ocean', label: 'Ocean', colors: ['#1e3a8a', '#3b82f6', '#06b6d4'] }
  ];

  if (loading) {
    return <LoadingSpinner message="Preparing 3D visualization..." />;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen lg:ml-80 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Cube className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">3D Visualization Unavailable</h2>
          <p className="text-gray-400">Upload your workout data to see interactive 3D charts.</p>
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
              3D Visualization
            </h1>
            <p className="text-gray-400">
              Interactive 3D charts powered by WebGL and Three.js
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex items-center px-4 py-2 rounded-xl border transition-all ${
                isAnimating 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:text-white'
              }`}
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAnimating ? 'Pause' : 'Play'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCameraPosition([10, 10, 10])}
              className="flex items-center px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset View
            </motion.button>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Visualization Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Visualization Type</label>
              <div className="flex space-x-2">
                {visualizationTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setVisualizationType(type.id)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                      visualizationType === type.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Scheme Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Scheme</label>
              <div className="flex space-x-2">
                {colorSchemes.map((scheme) => (
                  <motion.button
                    key={scheme.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setColorScheme(scheme.id)}
                    className={`p-2 rounded-lg transition-all ${
                      colorScheme === scheme.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{
                      background: `linear-gradient(45deg, ${scheme.colors.join(', ')})`
                    }}
                  >
                    <div className="w-6 h-6" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* View Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">View Controls</label>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowControls(!showControls)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all"
                >
                  {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3D Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative h-[600px] lg:h-[700px] bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
        >
          <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner size="medium" fullScreen={false} /></div>}>
            <Canvas camera={{ position: cameraPosition, fov: 75 }}>
              <Environment preset="night" />
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              {/* Render based on visualization type */}
              {visualizationType === 'volume_bars' && (
                <VolumeBars 
                  data={threeDData.volumeBars} 
                  isAnimating={isAnimating}
                  colorScheme={colorScheme}
                />
              )}
              
              {visualizationType === 'muscle_spheres' && (
                <MuscleGroupSpheres 
                  data={threeDData.muscleGroupSpheres} 
                  isAnimating={isAnimating}
                  colorScheme={colorScheme}
                />
              )}
              
              {visualizationType === 'progress_timeline' && (
                <ProgressTimeline 
                  data={threeDData.progressTimeline} 
                  isAnimating={isAnimating}
                  colorScheme={colorScheme}
                />
              )}
              
              {visualizationType === 'strength_mountain' && (
                <StrengthMountain 
                  data={threeDData.strengthMountain} 
                  isAnimating={isAnimating}
                  colorScheme={colorScheme}
                />
              )}
              
              {showControls && <OrbitControls enablePan enableZoom enableRotate />}
            </Canvas>
          </Suspense>
          
          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
            <h3 className="font-bold mb-2">
              {visualizationTypes.find(v => v.id === visualizationType)?.label}
            </h3>
            <p className="text-sm text-gray-300">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </p>
          </div>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Data Points', value: Object.keys(analytics.exerciseStats || {}).length },
            { label: 'Dimensions', value: '3D' },
            { label: 'Animation FPS', value: '60' },
            { label: 'Render Engine', value: 'WebGL' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl text-center"
            >
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// 3D Components
const VolumeBars = ({ data, isAnimating, colorScheme }) => {
  return (
    <group>
      {data.map((bar, index) => (
        <VolumeBarsBar 
          key={bar.id} 
          bar={bar} 
          index={index} 
          isAnimating={isAnimating}
          colorScheme={colorScheme}
        />
      ))}
    </group>
  );
};

const VolumeBarsBar = ({ bar, index, isAnimating, colorScheme }) => {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    }
  });

  const getColor = () => {
    const schemes = {
      gradient: new THREE.Color(`hsl(${(index * 30) % 360}, 70%, 60%)`),
      neon: new THREE.Color(index % 2 === 0 ? '#ff00ff' : '#00ffff'),
      fire: new THREE.Color(`hsl(${20 + index * 10}, 100%, 60%)`),
      ocean: new THREE.Color(`hsl(${200 + index * 15}, 80%, 60%)`)
    };
    return schemes[colorScheme] || schemes.gradient;
  };

  return (
    <group position={bar.position}>
      <Box
        ref={meshRef}
        args={[1, bar.height, 1]}
        position={[0, bar.height / 2, 0]}
      >
        <meshStandardMaterial color={getColor()} />
      </Box>
      <Text
        position={[0, bar.height + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {bar.name}
      </Text>
    </group>
  );
};

const MuscleGroupSpheres = ({ data, isAnimating, colorScheme }) => {
  return (
    <group>
      {data.map((sphere, index) => (
        <MuscleGroupSphere 
          key={sphere.id} 
          sphere={sphere} 
          index={index} 
          isAnimating={isAnimating}
          colorScheme={colorScheme}
        />
      ))}
    </group>
  );
};

const MuscleGroupSphere = ({ sphere, index, isAnimating, colorScheme }) => {
  const meshRef = React.useRef();
  
  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getColor = () => {
    const schemes = {
      gradient: new THREE.Color(`hsl(${(index * 60) % 360}, 70%, 60%)`),
      neon: new THREE.Color(['#ff00ff', '#00ffff', '#ffff00'][index % 3]),
      fire: new THREE.Color(['#ff4500', '#ff6347', '#ffd700'][index % 3]),
      ocean: new THREE.Color(['#1e3a8a', '#3b82f6', '#06b6d4'][index % 3])
    };
    return schemes[colorScheme] || schemes.gradient;
  };

  return (
    <group position={sphere.position}>
      <Sphere
        ref={meshRef}
        args={[sphere.radius, 32, 32]}
      >
        <meshStandardMaterial 
          color={getColor()} 
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <Text
        position={[0, sphere.radius + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {sphere.name}
      </Text>
    </group>
  );
};

const ProgressTimeline = ({ data, isAnimating, colorScheme }) => {
  const lineRef = React.useRef();
  
  useFrame((state) => {
    if (lineRef.current && isAnimating) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const points = data.map(point => new THREE.Vector3(...point.position));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={lineRef}>
      <line geometry={geometry}>
        <lineBasicMaterial color="#8b5cf6" linewidth={3} />
      </line>
      {data.map((point, index) => (
        <Sphere
          key={index}
          position={point.position}
          args={[0.1, 16, 16]}
        >
          <meshStandardMaterial color="#06b6d4" />
        </Sphere>
      ))}
    </group>
  );
};

const StrengthMountain = ({ data, isAnimating, colorScheme }) => {
  return (
    <group>
      {data.map((peak, index) => (
        <Cylinder
          key={peak.id}
          position={peak.position}
          args={[0.3, 0.5, peak.height, 8]}
        >
          <meshStandardMaterial 
            color={new THREE.Color(`hsl(${peak.progression * 10 + 200}, 70%, 60%)`)}
          />
        </Cylinder>
      ))}
    </group>
  );
};

// Placeholder for Mountain icon
const Mountain = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
  </svg>
);

export default ThreeDVisualization;