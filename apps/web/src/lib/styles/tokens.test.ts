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

const textPairs = [
	['text-primary', 'background'],
	['text-primary', 'surface'],
	['text-primary', 'surface-raised'],
	['text-secondary', 'background'],
	['text-secondary', 'surface'],
	['text-secondary', 'surface-raised'],
	['accent', 'background'],
	['accent', 'surface'],
	['accent', 'surface-raised'],
	['on-accent', 'accent']
] as const;

const nonTextPairs = [
	['accent', 'background'],
	['accent', 'surface'],
	['accent', 'surface-raised']
] as const;

describe('design token contrast', () => {
	it.each(textPairs)('%s on %s meets WCAG AA for text', (foreground, background) => {
		expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(
			WCAG_AA_TEXT
		);
	});

	it.each(nonTextPairs)(
		'%s focus ring on %s meets WCAG AA for UI components',
		(foreground, background) => {
			expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(
				WCAG_AA_NON_TEXT
			);
		}
	);
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
