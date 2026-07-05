/**
 * Design tokens — single source of truth for all visual style.
 *
 * Values are mirrored as CSS custom properties (so they work in plain
 * CSS contexts) and consumed by Tailwind via `@theme` in global.css.
 *
 * Do not introduce new colours, fonts, or radii outside this file.
 */

export const tokens = {
  color: {
    isoRed: '#e3000f',
    isoBlue: '#0061ad',
    accent: {
      DEFAULT: '#0061ad',
      light: '#3385d6',
      dark: '#003f73',
    },
    ink: {
      DEFAULT: '#0a0a0a',
      muted: '#4a4a4a',
      subtle: '#7a7a7a',
    },
    surface: {
      DEFAULT: '#ffffff',
      raised: '#f5f5f5',
      sunken: '#ededed',
    },
    surfaceDark: {
      DEFAULT: '#0e0e0e',
      raised: '#1a1a1a',
      sunken: '#050505',
    },
    line: '#d4d4d4',
    lineDark: '#2a2a2a',
  },
  font: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'Consolas',
      'monospace',
    ],
    serif: [
      'Source Serif Pro',
      'Georgia',
      'serif',
    ],
  },
  radius: {
    sm: '4px',
    DEFAULT: '8px',
    lg: '16px',
    pill: '9999px',
  },
  space: {
    pageX: 'clamp(1rem, 5vw, 3rem)',
    sectionY: 'clamp(3rem, 8vw, 6rem)',
  },
  layout: {
    contentWidth: '1200px',
    headerHeight: '80px',
  },
} as const;

export type ColorToken = keyof typeof tokens.color;
export type FontToken = keyof typeof tokens.font;
