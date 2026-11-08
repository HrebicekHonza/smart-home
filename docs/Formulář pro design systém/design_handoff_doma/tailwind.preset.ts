// Tailwind preset mapující tokeny z tokens.css. Použití: presets: [domaPreset]
import type { Config } from 'tailwindcss';

const v = (name: string) => `var(--${name})`;

export default {
  theme: {
    extend: {
      colors: {
        bg: v('color-background'),
        sunken: v('color-surface-sunken'),
        surface: { DEFAULT: v('color-surface'), hover: v('color-surface-hover') },
        raised: { DEFAULT: v('color-surface-raised'), hover: v('color-surface-raised-hover') },
        line: { DEFAULT: v('color-border'), subtle: v('color-border-subtle'), strong: v('color-border-strong') },
        fg: { DEFAULT: v('color-text-primary'), 2: v('color-text-secondary'), 3: v('color-text-tertiary'), off: v('color-text-disabled') },
        accent: { DEFAULT: v('color-accent'), hover: v('color-accent-hover'), on: v('color-on-accent'), muted: v('color-accent-muted'), 'muted-line': v('color-accent-muted-border') },
        success: { DEFAULT: v('color-success'), bg: v('color-success-bg'), text: v('color-success-text') },
        warning: { DEFAULT: v('color-warning'), bg: v('color-warning-bg'), text: v('color-warning-text') },
        danger: { DEFAULT: v('color-danger'), bg: v('color-danger-bg'), text: v('color-danger-text') }
      },
      borderRadius: { xs: v('radius-xs'), sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), xl: v('radius-xl'), '2xl': v('radius-2xl') },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'], mono: ['"Geist Mono"', 'ui-monospace', 'monospace'] },
      fontSize: {
        'value-xl': ['80px', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '500' }],
        'value-l': ['46px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        'value-m': ['36px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        'value-s': ['22px', { lineHeight: '1.1', fontWeight: '500' }],
        title: ['30px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        heading: ['16px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.55', fontWeight: '400' }],
        label: ['14px', { lineHeight: '1.3', fontWeight: '500' }],
        caption: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        micro: ['12px', { lineHeight: '1.35', fontWeight: '500' }],
        axis: ['11px', { lineHeight: '1.3', fontWeight: '400' }]
      },
      transitionDuration: { fast: '120ms', base: '150ms' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' }
    }
  }
} satisfies Partial<Config>;
