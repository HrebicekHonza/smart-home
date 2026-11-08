export type Tone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

export const TONE_TEXT: Record<Tone, string> = {
	accent: 'text-accent',
	neutral: 'text-text-secondary',
	success: 'text-success',
	warning: 'text-warning',
	danger: 'text-danger'
};

export const TONE_SURFACE: Record<Exclude<Tone, 'accent' | 'neutral'>, string> = {
	success: 'bg-success-bg',
	warning: 'bg-warning-bg',
	danger: 'bg-danger-bg'
};

export const TONE_SURFACE_TEXT: Record<Exclude<Tone, 'accent' | 'neutral'>, string> = {
	success: 'text-success-text',
	warning: 'text-warning-text',
	danger: 'text-danger-text'
};
