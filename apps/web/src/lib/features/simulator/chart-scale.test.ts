import { describe, expect, it } from 'vitest';
import { niceScale, polylinePoints } from './chart-scale.ts';

const NICE_STEPS = [1, 2, 2.5, 5];

function stepOf(ticks: readonly number[]): number {
	return (ticks[1] ?? 0) - (ticks[0] ?? 0);
}

describe('niceScale', () => {
	it.each([[[17.8, 21.3]], [[0, 800]], [[-14.6, 1.9]], [[0.29, 3.1]]])(
		'covers %j with evenly spaced round ticks',
		(values) => {
			const scale = niceScale(values);
			const step = stepOf(scale.ticks);
			const mantissa = step / 10 ** Math.floor(Math.log10(step));

			expect(scale.min).toBeLessThanOrEqual(Math.min(...values));
			expect(scale.max).toBeGreaterThanOrEqual(Math.max(...values));
			expect(scale.ticks.at(0)).toBe(scale.min);
			expect(scale.ticks.at(-1)).toBe(scale.max);
			expect(NICE_STEPS.some((nice) => Math.abs(mantissa - nice) < 1e-9)).toBe(true);
			scale.ticks.slice(1).forEach((tick, index) => {
				expect(tick - (scale.ticks[index] ?? 0)).toBeCloseTo(step, 9);
			});
		}
	);

	it('keeps a zero baseline for power', () => {
		expect(niceScale([0, 800]).min).toBe(0);
	});

	it('handles a flat series', () => {
		const scale = niceScale([800, 800]);
		expect(scale.max).toBeGreaterThan(scale.min);
	});
});

describe('polylinePoints', () => {
	it('maps time to x and higher values to smaller y', () => {
		const points = polylinePoints([0, 50, 100], [0, 5, 10], 100, niceScale([0, 10], 3), 200, 100);
		expect(points).toBe('0.0,100.00 100.0,50.00 200.0,0.00');
	});
});
