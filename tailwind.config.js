/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'mono': ['JetBrains Mono', 'monospace'],
        },
        colors: {
          // Custom color system for the app
          primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          secondary: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
          },
          accent: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          neural: {
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
          }
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
          'neural-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a78bfa' fill-opacity='0.05'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
          'circuit-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Cpath d='m0 30h60m-30-30v60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
          'gradient-shift': 'gradient-shift 3s ease infinite',
          'matrix-rain': 'matrix-rain 20s linear infinite',
          'data-flow': 'data-flow 2s ease-in-out infinite',
          'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
          'hologram': 'hologram 4s ease-in-out infinite',
          'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
          'scan-line': 'scan-line 2s linear infinite',
          'typewriter': 'typewriter 3s steps(20) infinite',
          'glitch': 'glitch 2s infinite',
        },
        keyframes: {
          'float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          'pulse-glow': {
            '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
            '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4)' },
          },
          'gradient-shift': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          'matrix-rain': {
            '0%': { transform: 'translateY(-100vh)', opacity: '0' },
            '10%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translateY(100vh)', opacity: '0' },
          },
          'data-flow': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
          'neon-pulse': {
            '0%': { textShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6' },
            '100%': { textShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6, 0 0 40px #8b5cf6' },
          },
          'hologram': {
            '0%, 100%': { opacity: '0.7', transform: 'rotateY(0deg)' },
            '25%': { opacity: '0.9', transform: 'rotateY(1deg)' },
            '50%': { opacity: '1', transform: 'rotateY(0deg)' },
            '75%': { opacity: '0.9', transform: 'rotateY(-1deg)' },
          },
          'neural-pulse': {
            '0%, 100%': { 
              transform: 'scale(1)',
              opacity: '0.8',
            },
            '50%': { 
              transform: 'scale(1.05)',
              opacity: '1',
            },
          },
          'scan-line': {
            '0%': { transform: 'translateY(-100vh)' },
            '100%': { transform: 'translateY(100vh)' },
          },
          'typewriter': {
            'from': { width: '0' },
            'to': { width: '100%' },
          },
          'glitch': {
            '0%, 100%': { transform: 'translate(0)' },
            '20%': { transform: 'translate(-2px, 2px)' },
            '40%': { transform: 'translate(-2px, -2px)' },
            '60%': { transform: 'translate(2px, 2px)' },
            '80%': { transform: 'translate(2px, -2px)' },
          },
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
          '144': '36rem',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
        },
        backdropBlur: {
          '4xl': '72px',
        },
        boxShadow: {
          'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
          'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
          'glow-xl': '0 0 60px rgba(139, 92, 246, 0.5)',
          'neural': '0 8px 32px rgba(139, 92, 246, 0.12)',
          'neon': '0 0 5px currentColor, 0 0 20px currentColor, 0 0 35px currentColor',
        },
        transitionDuration: {
          '2000': '2000ms',
          '3000': '3000ms',
        },
        scale: {
          '102': '1.02',
          '103': '1.03',
        },
        blur: {
          '4xl': '72px',
        },
        brightness: {
          '25': '.25',
          '175': '1.75',
        },
        cursor: {
          'crosshair': 'crosshair',
          'grab': 'grab',
          'grabbing': 'grabbing',
        },
        flexGrow: {
          '2': '2',
          '3': '3',
        },
        gridTemplateColumns: {
          '13': 'repeat(13, minmax(0, 1fr))',
          '14': 'repeat(14, minmax(0, 1fr))',
          '15': 'repeat(15, minmax(0, 1fr))',
          '16': 'repeat(16, minmax(0, 1fr))',
        },
        gridTemplateRows: {
          '7': 'repeat(7, minmax(0, 1fr))',
          '8': 'repeat(8, minmax(0, 1fr))',
          '9': 'repeat(9, minmax(0, 1fr))',
          '10': 'repeat(10, minmax(0, 1fr))',
        },
        maxWidth: {
          '8xl': '88rem',
          '9xl': '96rem',
        },
        minHeight: {
          '12': '3rem',
          '16': '4rem',
          '20': '5rem',
        },
        strokeWidth: {
          '3': '3px',
          '4': '4px',
        },
      },
    },
    plugins: [
      // Custom plugin for utilities
      function({ addUtilities, addComponents, theme }) {
        const newUtilities = {
          '.glass-morphism': {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          '.glass-morphism-dark': {
            background: 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
          '.text-gradient': {
            background: 'linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 3s ease infinite',
          },
          '.neon-text': {
            animation: 'neon-pulse 2s ease-in-out infinite alternate',
          },
          '.neural-grid': {
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          },
          '.data-stream': {
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '0',
              height: '2px',
              width: '100%',
              background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)',
              animation: 'data-flow 2s ease-in-out infinite',
            },
          },
          '.scan-lines': {
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: `
                linear-gradient(transparent 50%, rgba(139, 92, 246, 0.03) 50%),
                linear-gradient(90deg, transparent 50%, rgba(139, 92, 246, 0.03) 50%)
              `,
              backgroundSize: '100% 4px, 4px 100%',
              pointerEvents: 'none',
              animation: 'scan-line 20s linear infinite',
            },
          },
        };
  
        const newComponents = {
          '.btn-neural': {
            padding: theme('spacing.3') + ' ' + theme('spacing.6'),
            background: 'linear-gradient(45deg, ' + theme('colors.primary.500') + ', ' + theme('colors.secondary.500') + ')',
            color: theme('colors.white'),
            fontWeight: theme('fontWeight.semibold'),
            borderRadius: theme('borderRadius.xl'),
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover::before': {
              left: '100%',
            },
          },
          '.card-neural': {
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: theme('borderRadius.2xl'),
            padding: theme('spacing.6'),
            transition: 'all 0.3s ease',
            '&:hover': {
              border: '1px solid rgba(139, 92, 246, 0.4)',
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1)',
            },
          },
          '.progress-neural': {
            width: '100%',
            height: theme('spacing.2'),
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: theme('borderRadius.full'),
            overflow: 'hidden',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              height: '100%',
              background: 'linear-gradient(90deg, ' + theme('colors.primary.500') + ', ' + theme('colors.secondary.500') + ')',
              borderRadius: theme('borderRadius.full'),
              transition: 'width 1s ease-out',
            },
          },
        };
  
        addUtilities(newUtilities);
        addComponents(newComponents);
      },
    ],
    future: {
      hoverOnlyWhenSupported: true,
    },
  }