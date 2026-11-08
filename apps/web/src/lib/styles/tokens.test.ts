import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast.ts';

const tokensCss = readFileSync(join(import.meta.dirname, 'tokens.css'), 'utf8');

const tokens = Object.fromEntries(
	[...tokensCss.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, value]) => [
		name,
		value
	])
) as Record<string, string>;

const WCAG_AA_TEXT = 4.5;
const WCAG_AA_NON_TEXT = 3;

const surfaces = [
	'background',
	'surface-sunken',
	'surface',
	'surface-hover',
	'surface-raised'
] as const;

const textPairs = [
	...surfaces
		.flatMap((surface) =>
			(['text-primary', 'text-secondary', 'text-tertiary', 'accent'] as const).map(
				(text) => [text, surface] as const
			)
		)
		.filter(([text, surface]) => !(text === 'text-tertiary' && surface === 'surface-raised')),
	...(['success', 'warning', 'danger'] as const).flatMap((state) => [
		[state, 'surface'] as const,
		[`${state}-text`, `${state}-bg`] as const,
		['text-primary', `${state}-bg`] as const
	]),
	['accent', 'accent-muted'],
	['on-accent', 'accent'],
	['on-accent', 'accent-hover']
] as const;

const nonTextPairs = [
	['border-strong', 'surface'],
	['border-strong', 'surface-sunken'],
	['accent', 'background'],
	['accent', 'surface']
] as const;

describe('design token contrast', () => {
	it.each(textPairs)('%s on %s meets WCAG AA for text', (foreground, background) => {
		expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(
			WCAG_AA_TEXT
		);
	});

	it.each(nonTextPairs)('%s on %s meets WCAG AA for UI components', (foreground, background) => {
		expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(
			WCAG_AA_NON_TEXT
		);
	});
});

describe('contrastRatio', () => {
	it('matches the reference values for black and white', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
		expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
	});
});

function token(name: string): string {
	const value = tokens[name];
	if (!value) throw new Error(`Missing colour token --color-${name}`);
	return value;
}
