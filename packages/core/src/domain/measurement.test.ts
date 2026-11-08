import { describe, expect, it } from 'vitest';
import { isStale } from './measurement.ts';

describe('isStale', () => {
	const measurement = { value: 21, measuredAt: 1_000_000 };

	it('treats a measurement exactly at the age limit as fresh', () => {
		expect(isStale(measurement, 1_000_000 + 60_000, 60_000)).toBe(false);
	});

	it('treats a measurement older than the limit as stale', () => {
		expect(isStale(measurement, 1_000_000 + 60_001, 60_000)).toBe(true);
	});
});
