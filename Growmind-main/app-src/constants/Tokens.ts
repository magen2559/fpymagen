/**
 * Design Tokens for GrowMind
 * Cinematic, premium color palette with dark mode support
 */

export const DarkColors = {
    // Primary - Soft Blue / Indigo (Like the Play Button)
    primary: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1', // Main primary
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
    },

    // Secondary - Soft Purple / Pink
    secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Main secondary
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
    },

    // Accent - Soft Emerald / Teal / Mint
    accent: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Main accent
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },

    // Neutrals - Cool soft greys
    neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },

    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background colors (dark mode)
    background: {
        primary: '#09090b',
        secondary: '#18181b',
        tertiary: '#27272a',
        elevated: '#3f3f46',
    },

    // Text colors
    text: {
        primary: '#fafafa',
        secondary: '#d4d4d8',
        tertiary: '#a1a1aa',
        disabled: '#71717a',
        inverse: '#18181b',
    },

    // Glass morphism
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        dark: 'rgba(0, 0, 0, 0.3)',
    },
};

export const Typography = {
    // Font families
    fonts: {
        heading: 'Inter_700Bold',
        body: 'Inter_400Regular',
        mono: 'SpaceMono_400Regular',
    },

    // Font sizes (mobile-first)
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    },

    // Line heights
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
};

export const BorderRadius = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    full: 9999,
};

export const Shadows = {
    sm: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    lg: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    xl: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 36,
        elevation: 12,
    },
};

export const Animation = {
    // Duration in milliseconds
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
    },

    // Easing curves
    easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },
};

// 3D Scene constants
export const Scene = {
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [0, 5, 10] as [number, number, number],
    },

    lighting: {
        ambient: {
            intensity: 0.5,
            color: '#ffffff',
        },
        directional: {
            intensity: 0.8,
            color: '#ffffff',
            position: [5, 10, 5] as [number, number, number],
        },
        point: {
            intensity: 1.0,
            color: '#10b981',
            position: [0, 5, 0] as [number, number, number],
        },
    },

    fog: {
        color: '#09090b',
        near: 10,
        far: 50,
    },
};

export const LightColors = {
    ...DarkColors,
    // Background colors (light mode - very soft, bright airy)
    background: {
        primary: '#f9fafd', // Very light cool tint
        secondary: '#ffffff', // Pure white cards
        tertiary: '#f1f5f9',
        elevated: '#ffffff',
    },
    // Text colors
    text: {
        primary: '#0f172a', // Darkest slate
        secondary: '#475569',
        tertiary: '#94a3b8',
        disabled: '#cbd5e1',
        inverse: '#ffffff',
    },
    neutral: {
        ...DarkColors.neutral,
    },
};

export const Colors = DarkColors; // Fallback

export const Tokens = {
    Colors: DarkColors,
    DarkColors,
    LightColors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
    Animation,
    Scene,
};

export default Tokens;
