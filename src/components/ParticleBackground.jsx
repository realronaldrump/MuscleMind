import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { theme, effects } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Particle system
  const particlesRef = useRef([]);
  const connectionsRef = useRef([]);

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !effects.particles.enabled) return;

    const ctx = canvas.getContext('2d');
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(effects.particles.density, 150);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * effects.particles.speed,
          vy: (Math.random() - 0.5) * effects.particles.speed,
          size: Math.random() * effects.particles.size + 1,
          opacity: Math.random() * 0.5 + 0.2,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 50,
          hue: Math.random() * 60 + 220, // Blue to purple range
          pulsate: Math.random() * 0.02 + 0.01
        });
      }
    };

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update life
        particle.life++;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        // Boundaries
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(mousePos.x - particle.x, 2) + 
          Math.pow(mousePos.y - particle.y, 2)
        );

        if (mouseDistance < 100) {
          const force = (100 - mouseDistance) / 100;
          const angle = Math.atan2(particle.y - mousePos.y, particle.x - mousePos.x);
          particle.vx += Math.cos(angle) * force * 0.1;
          particle.vy += Math.sin(angle) * force * 0.1;
          particle.opacity = Math.min(1, particle.opacity + force * 0.3);
        } else {
          particle.opacity = Math.max(0.2, particle.opacity - 0.01);
        }

        // Pulsate
        particle.opacity += Math.sin(particle.life * particle.pulsate) * 0.1;
        particle.size += Math.sin(particle.life * particle.pulsate * 2) * 0.2;
      });
    };

    const drawParticles = () => {
      particlesRef.current.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Create gradient for particle with safe radius values
        const radius = Math.max(0.1, particle.size * 3); // Ensure minimum radius
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, radius
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, 1)`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, 0.5)`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 40%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.1, particle.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawConnections = () => {
      const maxDistance = 150;
      connectionsRef.current = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const particle1 = particlesRef.current[i];
          const particle2 = particlesRef.current[j];
          
          const distance = Math.sqrt(
            Math.pow(particle1.x - particle2.x, 2) + 
            Math.pow(particle1.y - particle2.y, 2)
          );

          if (distance < maxDistance) {
            const opacity = (maxDistance - distance) / maxDistance * 0.3;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = `hsla(${(particle1.hue + particle2.hue) / 2}, 60%, 50%, 1)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
            ctx.restore();

            connectionsRef.current.push({
              x1: particle1.x,
              y1: particle1.y,
              x2: particle2.x,
              y2: particle2.y,
              opacity
            });
          }
        }
      }
    };

    const drawScanlines = () => {
      if (!effects.scanlines.enabled) return;
      
      ctx.save();
      ctx.globalAlpha = effects.scanlines.opacity;
      ctx.fillStyle = theme.primary;
      
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
      ctx.restore();
    };

    const drawDataFlow = () => {
      const time = Date.now() * 0.001;
      
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = theme.secondary;
      ctx.lineWidth = 2;
      
      // Horizontal data streams
      for (let i = 0; i < 5; i++) {
        const y = (canvas.height / 6) * (i + 1);
        const x = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width;
        
        ctx.beginPath();
        ctx.moveTo(x - 100, y);
        ctx.lineTo(x + 100, y);
        ctx.stroke();
      }
      
      // Vertical data streams
      for (let i = 0; i < 3; i++) {
        const x = (canvas.width / 4) * (i + 1);
        const y = (Math.sin(time * 1.5 + i) * 0.5 + 0.5) * canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 80);
        ctx.lineTo(x, y + 80);
        ctx.stroke();
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      gradient.addColorStop(0.5, 'rgba(30, 27, 75, 0.97)');
      gradient.addColorStop(1, 'rgba(49, 46, 129, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      updateParticles();
      drawConnections();
      drawParticles();
      drawDataFlow();
      drawScanlines();

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [windowSize, effects, theme, mousePos]);

  return (
    <>
      {/* Canvas for particle system */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          background: 'transparent',
          opacity: effects.particles.enabled ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}
      />

      {/* CSS-based background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{ background: theme.background }}
        />

        {/* Grid Pattern */}
        {effects.particles.enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: effects.animations.enabled ? 'matrix-rain 20s linear infinite' : 'none'
            }}
          />
        )}

        {/* Floating Geometric Shapes */}
        {effects.animations.enabled && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 border border-purple-500/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: i % 2 === 0 ? '50%' : '0',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}

        {/* Glow Effects */}
        {effects.glow.enabled && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-blue-500/5 rounded-full blur-3xl" />
          </>
        )}

        {/* Neural Network Connections */}
        {effects.animations.enabled && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2 }}
          >
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={theme.primary} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Animated connection lines */}
              <motion.path
                d="M 100 100 Q 200 50 300 100 Q 400 150 500 100"
                stroke="url(#connectionGradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.path
                d="M 200 200 Q 300 150 400 200 Q 500 250 600 200"
                stroke="url(#connectionGradient)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
            </svg>
          </motion.div>
        )}

        {/* Chromatic Aberration Effect */}
        {effects.chromatic.enabled && (
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, rgba(255, 0, 0, ${effects.chromatic.intensity}) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 255, 255, ${effects.chromatic.intensity}) 0%, transparent 50%)
              `,
              mixBlendMode: 'screen'
            }}
          />
        )}
      </div>
    </>
  );
};

export default ParticleBackground;