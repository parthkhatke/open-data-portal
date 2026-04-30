import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Charlotte Civic Design System
      colors: {
        // Base Neutrals - Institutional palette
        civic: {
          white: '#FAFAF9',      // Off-white background
          cream: '#F5F5F4',      // Soft surface
          sand: '#E7E5E4',       // Subtle border
          stone: '#A8A29E',      // Muted text
          charcoal: '#44403C',   // Body text
          ink: '#1C1917',        // Headlines
        },
        // Domain Accent Colors
        domain: {
          // Transportation - Light Rail Blue
          transport: {
            50: '#EEF6FA',
            100: '#D5E9F3',
            200: '#A8D2E6',
            300: '#6BB4D4',
            400: '#3B97C2',
            500: '#2B7A9E',    // Primary - Charlotte LYNX inspired
            600: '#245F7C',
            700: '#1D4A5F',
            800: '#163644',
            900: '#0F2430',
          },
          // Housing - Warm Brick/Clay
          housing: {
            50: '#FBF6F4',
            100: '#F5E8E2',
            200: '#EACFC3',
            300: '#DAAB96',
            400: '#C78B6F',
            500: '#B46B4E',    // Primary - Clay brick
            600: '#954D35',
            700: '#723B2A',
            800: '#522C21',
            900: '#361D16',
          },
          // Economy - Muted Gold/Bronze
          economy: {
            50: '#FAF8F3',
            100: '#F3EFE2',
            200: '#E5DCC3',
            300: '#D4C49A',
            400: '#C2AA70',
            500: '#A8914D',    // Primary - Banking bronze
            600: '#8A7540',
            700: '#6A5A33',
            800: '#4D4127',
            900: '#332C1B',
          },
          // Environment - Desaturated Green
          environment: {
            50: '#F5F7F5',
            100: '#E8ECE8',
            200: '#D0D9D0',
            300: '#B0BFB0',
            400: '#8AA58A',
            500: '#6B8B6B',    // Primary - Forest/canopy
            600: '#556F55',
            700: '#425542',
            800: '#313F31',
            900: '#212A21',
          },
          // Public Safety - Restrained Red
          safety: {
            50: '#FBF5F5',
            100: '#F5E6E6',
            200: '#E8CBCB',
            300: '#D4A5A5',
            400: '#BC7F7F',
            500: '#9B5C5C',    // Primary - Never pure red
            600: '#7D4A4A',
            700: '#5F3939',
            800: '#442A2A',
            900: '#2C1C1C',
          },
        },
        // Legacy mapping for compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      // Typography Scale
      fontFamily: {
        // Authoritative serif for headlines
        display: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        // Highly readable sans for body
        body: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
        // Monospace for data
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Large type for civic facts
        'civic-hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'civic-display': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'civic-title': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'civic-heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        'civic-subheading': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'civic-body': ['1rem', { lineHeight: '1.7' }],
        'civic-caption': ['0.875rem', { lineHeight: '1.5' }],
        'civic-small': ['0.75rem', { lineHeight: '1.4' }],
        // Metric display sizes
        'metric-large': ['3.5rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'metric-medium': ['2rem', { lineHeight: '1.1', fontWeight: '600' }],
        'metric-small': ['1.25rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      // Generous spacing
      spacing: {
        'civic-xs': '0.5rem',    // 8px
        'civic-sm': '1rem',      // 16px
        'civic-md': '1.5rem',    // 24px
        'civic-lg': '2.5rem',    // 40px
        'civic-xl': '4rem',      // 64px
        'civic-2xl': '6rem',     // 96px
        'civic-3xl': '8rem',     // 128px
      },
      maxWidth: {
        'civic-narrow': '42rem',   // Text-optimized
        'civic-content': '56rem',  // Content area
        'civic-wide': '80rem',     // Full layouts
        'civic-full': '96rem',     // Edge-to-edge
      },
      borderRadius: {
        'civic': '0.375rem',      // Subtle rounding
        'civic-lg': '0.75rem',    // Cards
        'civic-xl': '1rem',       // Containers
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'civic-sm': '0 1px 3px 0 rgb(28 25 23 / 0.04), 0 1px 2px -1px rgb(28 25 23 / 0.04)',
        'civic': '0 4px 6px -1px rgb(28 25 23 / 0.05), 0 2px 4px -2px rgb(28 25 23 / 0.05)',
        'civic-lg': '0 10px 15px -3px rgb(28 25 23 / 0.06), 0 4px 6px -4px rgb(28 25 23 / 0.04)',
        'civic-xl': '0 20px 25px -5px rgb(28 25 23 / 0.07), 0 8px 10px -6px rgb(28 25 23 / 0.04)',
      },
      // Charlotte Light Rail Motion System
      transitionTimingFunction: {
        'rail': 'cubic-bezier(0.25, 0.1, 0.25, 1)',       // Smooth linear
        'rail-in': 'cubic-bezier(0.4, 0, 1, 1)',          // Approach
        'rail-out': 'cubic-bezier(0, 0, 0.2, 1)',         // Departure
        'rail-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',    // Glide
      },
      transitionDuration: {
        'rail-fast': '200ms',
        'rail': '400ms',
        'rail-slow': '700ms',
        'rail-reveal': '1000ms',
      },
      animation: {
        'rail-slide-in': 'railSlideIn 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'rail-fade-in': 'railFadeIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'rail-pulse': 'railPulse 3s ease-in-out infinite',
        'system-breathe': 'systemBreathe 8s ease-in-out infinite',
        'node-glow': 'nodeGlow 4s ease-in-out infinite',
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        railSlideIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
        railFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        railPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        systemBreathe: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.7'
          },
          '50%': { 
            transform: 'scale(1.02)',
            opacity: '1'
          },
        },
        nodeGlow: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(43, 122, 158, 0)'
          },
          '50%': {
            boxShadow: '0 0 20px 4px rgba(43, 122, 158, 0.15)'
          }
        },
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      // Backdrop filters
      backdropBlur: {
        'civic': '12px',
      },
    },
  },
  plugins: [],
};

export default config;
