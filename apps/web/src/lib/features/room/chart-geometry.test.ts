import { describe, expect, it } from 'vitest';
import { chartGeometry, lastMeasurementBeforeGap, measuredSummary } from './chart-geometry.ts';

const point = (at: number, measured: number | null, target: number) => ({ at, measured, target });

describe('chartGeometry', () => {
	it('does not bridge gaps in measurements', () => {
		const geometry = chartGeometry(
			[point(0, 20, 21), point(1, 20.5, 21), point(2, null, 21), point(3, 21, 21)],
			300,
			100
		);
		expect(geometry.measured).toHaveLength(2);
	});

	it('draws the target as a step line', () => {
		const geometry = chartGeometry([point(0, 20, 19), point(1, 20, 22)], 100, 100);
		const vertices = geometry.target.split(' ');
		expect(vertices).toHaveLength(3);
		expect(vertices[1]?.split(',')[0]).toBe(vertices[2]?.split(',')[0]);
	});

	it('pads the value axis to whole degrees around all values', () => {
		expect(chartGeometry([point(0, 18.4, 22), point(1, 20.6, 22)], 100, 100).yTicks).toEqual([
			23, 20.5, 18
		]);
	});
});

describe('measuredSummary', () => {
	it('ignores missing measurements', () => {
		expect(measuredSummary([point(0, 19, 20), point(1, null, 20), point(2, 21, 20)])).toEqual({
			min: 19,
			max: 21,
			average: 20
		});
	});

	it('returns null without measurements', () => {
		expect(measuredSummary([point(0, null, 20)])).toBeNull();
	});
});

describe('lastMeasurementBeforeGap', () => {
	it('returns the last point measured before data stops', () => {
		const points = [point(0, 19, 20), point(5, 19.5, 20), point(10, null, 20)];
		expect(lastMeasurementBeforeGap(points)?.at).toBe(5);
	});

	it('returns nothing without a gap', () => {
		expect(lastMeasurementBeforeGap([point(0, 19, 20)])).toBeUndefined();
	});
});
