import { describe, expect, it } from 'vitest';
import { at, room } from './fixtures.test-support.ts';
import { overrideUntil } from './override.ts';
import { effectiveTarget } from './target.ts';

const now = at(8, 24);

describe('effectiveTarget', () => {
	it('follows the schedule until its next change in home mode', () => {
		expect(effectiveTarget(room(), 'home', now)).toEqual({
			target: 22,
			source: 'schedule',
			validUntil: at(22)
		});
	});

	it('holds 17 °C in away mode', () => {
		expect(effectiveTarget(room(), 'away', now)).toEqual({
			target: 17,
			source: 'mode-away',
			validUntil: 'mode-change'
		});
	});

	it('holds the night target of the schedule in night mode', () => {
		expect(effectiveTarget(room(), 'night', now)).toMatchObject({
			target: 19,
			source: 'mode-night'
		});
	});

	it('lets an active manual override win over modes and the schedule', () => {
		const override = { target: 23, until: at(10, 24), createdAt: now };
		expect(effectiveTarget(room({ override }), 'away', now)).toEqual({
			target: 23,
			source: 'manual',
			validUntil: at(10, 24)
		});
	});

	it('ignores an expired override', () => {
		const override = { target: 23, until: at(8, 0), createdAt: at(6) };
		expect(effectiveTarget(room({ override }), 'home', now).source).toBe('schedule');
	});

	it('keeps a permanent override until it is cancelled', () => {
		const override = { target: 21, until: null, createdAt: at(1) };
		expect(effectiveTarget(room({ override }), 'home', now)).toMatchObject({
			target: 21,
			validUntil: 'permanent'
		});
	});
});

describe('overrideUntil', () => {
	const schedule = room().schedule;

	it.each([
		['1h', at(9, 24)],
		['2h', at(10, 24)],
		['next-change', at(22)],
		['permanent', null]
	] as const)('resolves %s', (duration, expected) => {
		expect(overrideUntil(duration, now, schedule)).toBe(expected);
	});
});
