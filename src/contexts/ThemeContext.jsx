import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ThemeContext = createContext();

// Theme configurations
const themes = {
  dark: {
    name: 'Dark',
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    accent: '#10b981',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 75%, #1e293b 100%)',
    surface: 'rgba(15, 23, 42, 0.8)',
    surfaceLight: 'rgba(30, 41, 59, 0.6)',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    border: 'rgba(139, 92, 246, 0.2)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassStrong: 'rgba(255, 255, 255, 0.2)'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    background: 'linear-gradient(135deg, #000000 0%, #1a0033 25%, #003366 75%, #000000 100%)',
    surface: 'rgba(0, 0, 0, 0.9)',
    surfaceLight: 'rgba(26, 0, 51, 0.8)',
    text: '#ffffff',
    textSecondary: '#ff00ff',
    border: 'rgba(255, 0, 255, 0.4)',
    glass: 'rgba(255, 0, 255, 0.1)',
    glassStrong: 'rgba(255, 0, 255, 0.2)'
  },
  matrix: {
    name: 'Matrix',
    primary: '#00ff00',
    secondary: '#00cc00',
    accent: '#ffffff',
    background: 'linear-gradient(135deg, #000000 0%, #001100 25%, #002200 75%, #000000 100%)',
    surface: 'rgba(0, 0, 0, 0.95)',
    surfaceLight: 'rgba(0, 17, 0, 0.8)',
    text: '#00ff00',
    textSecondary: '#00cc00',
    border: 'rgba(0, 255, 0, 0.3)',
    glass: 'rgba(0, 255, 0, 0.1)',
    glassStrong: 'rgba(0, 255, 0, 0.2)'
  },
  neon: {
    name: 'Neon',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#45b7d1',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 75%, #1a1a2e 100%)',
    surface: 'rgba(26, 26, 46, 0.9)',
    surfaceLight: 'rgba(22, 33, 62, 0.7)',
    text: '#ffffff',
    textSecondary: '#ff6b6b',
    border: 'rgba(255, 107, 107, 0.3)',
    glass: 'rgba(255, 107, 107, 0.1)',
    glassStrong: 'rgba(255, 107, 107, 0.2)'
  },
  hologram: {
    name: 'Hologram',
    primary: '#00d4ff',
    secondary: '#7c4dff',
    accent: '#ff4081',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 25%, #3949ab 75%, #0a0e27 100%)',
    surface: 'rgba(10, 14, 39, 0.8)',
    surfaceLight: 'rgba(26, 35, 126, 0.6)',
    text: '#ffffff',
    textSecondary: '#00d4ff',
    border: 'rgba(0, 212, 255, 0.3)',
    glass: 'rgba(0, 212, 255, 0.1)',
    glassStrong: 'rgba(0, 212, 255, 0.2)'
  }
};

// Visual effects settings
const effectSettings = {
  particles: {
    enabled: true,
    density: 50,
    speed: 0.5,
    size: 2
  },
  animations: {
    enabled: true,
    speed: 1,
    intensity: 'normal'
  },
  glassmorphism: {
    enabled: true,
    blur: 10,
    opacity: 0.1
  },
  glow: {
    enabled: true,
    intensity: 0.3,
    color: 'auto'
  },
  scanlines: {
    enabled: false,
    opacity: 0.05,
    speed: 2
  },
  chromatic: {
    enabled: false,
    intensity: 0.1
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [effects, setEffects] = useState(effectSettings);
  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false
  });

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('musclemind_theme');
    const savedEffects = localStorage.getItem('musclemind_effects');
    const savedAccessibility = localStorage.getItem('musclemind_accessibility');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedEffects) {
      setEffects({ ...effectSettings, ...JSON.parse(savedEffects) });
    }
    
    if (savedAccessibility) {
      setAccessibility({ ...accessibility, ...JSON.parse(savedAccessibility) });
    }

    // Check for system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAccessibility(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-glass', theme.glass);
    root.style.setProperty('--color-glass-strong', theme.glassStrong);
    root.style.setProperty('--background-gradient', theme.background);
    root.style.setProperty('--surface-color', theme.surface);
    root.style.setProperty('--surface-light', theme.surfaceLight);
    
    // Apply effects
    root.style.setProperty('--blur-amount', `${effects.glassmorphism.blur}px`);
    root.style.setProperty('--glass-opacity', effects.glassmorphism.opacity);
    root.style.setProperty('--glow-intensity', effects.glow.intensity);
    root.style.setProperty('--animation-speed', effects.animations.speed);
    
    // Apply accessibility settings
    if (accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.setProperty('--animation-duration', '');
      root.style.setProperty('--transition-duration', '');
    }
    
    if (accessibility.highContrast) {
      root.style.setProperty('--color-border', '#ffffff');
      root.style.setProperty('--background-gradient', '#000000');
    }
    
    if (accessibility.largeText) {
      root.style.setProperty('--font-size-base', '1.125rem');
      root.style.setProperty('--font-size-lg', '1.5rem');
      root.style.setProperty('--font-size-xl', '2rem');
    } else {
      root.style.setProperty('--font-size-base', '1rem');
      root.style.setProperty('--font-size-lg', '1.25rem');
      root.style.setProperty('--font-size-xl', '1.5rem');
    }
    
    localStorage.setItem('musclemind_theme', currentTheme);
  }, [currentTheme, effects, accessibility]);

  // Save effects and accessibility to localStorage
  useEffect(() => {
    localStorage.setItem('musclemind_effects', JSON.stringify(effects));
  }, [effects]);

  useEffect(() => {
    localStorage.setItem('musclemind_accessibility', JSON.stringify(accessibility));
  }, [accessibility]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      toast.success(`Theme changed to ${themes[themeName].name}!`);
    }
  };

  const updateEffects = (newEffects) => {
    setEffects(prev => ({ ...prev, ...newEffects }));
  };

  const updateAccessibility = (newSettings) => {
    setAccessibility(prev => ({ ...prev, ...newSettings }));
    toast.success('Accessibility settings updated!');
  };

  const resetToDefaults = () => {
    setCurrentTheme('dark');
    setEffects(effectSettings);
    setAccessibility({
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReader: false
    });
    toast.success('Theme settings reset to defaults!');
  };

  const toggleEffect = (effectName) => {
    setEffects(prev => ({
      ...prev,
      [effectName]: {
        ...prev[effectName],
        enabled: !prev[effectName].enabled
      }
    }));
  };

  const getThemeCSS = () => {
    const theme = themes[currentTheme];
    return {
      '--color-primary': theme.primary,
      '--color-secondary': theme.secondary,
      '--color-accent': theme.accent,
      '--color-text': theme.text,
      '--color-text-secondary': theme.textSecondary,
      '--color-border': theme.border,
      '--color-glass': theme.glass,
      '--background-gradient': theme.background
    };
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    effects,
    accessibility,
    actions: {
      changeTheme,
      updateEffects,
      updateAccessibility,
      resetToDefaults,
      toggleEffect,
      getThemeCSS
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        style={getThemeCSS()}
        className={`theme-${currentTheme} ${accessibility.reducedMotion ? 'reduced-motion' : ''} ${accessibility.highContrast ? 'high-contrast' : ''}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;