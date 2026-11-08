import type { Celsius, HistoryPoint } from '@doma/core';

export interface ChartGeometry {
	readonly measured: readonly string[];
	readonly target: string;
	readonly yTicks: readonly [Celsius, Celsius, Celsius];
	readonly gridLines: readonly number[];
}

const PADDING: Celsius = 0.3;

export function chartGeometry(
	points: readonly HistoryPoint[],
	width: number,
	height: number
): ChartGeometry {
	const values = points.flatMap((point) =>
		point.measured === null ? [point.target] : [point.target, point.measured]
	);
	const low = Math.floor(Math.min(...values, Infinity) - PADDING);
	const high = Math.ceil(Math.max(...values, -Infinity) + PADDING);
	const span = Math.max(high - low, 1);
	const last = Math.max(points.length - 1, 1);

	const x = (index: number) => ((index / last) * width).toFixed(1);
	const y = (value: Celsius) => (((high - value) / span) * height).toFixed(1);

	const measured: string[] = [];
	let current: string[] = [];
	points.forEach((point, index) => {
		if (point.measured === null) {
			if (current.length > 0) measured.push(current.join(' '));
			current = [];
			return;
		}
		current.push(`${x(index)},${y(point.measured)}`);
	});
	if (current.length > 0) measured.push(current.join(' '));

	const target = points
		.flatMap((point, index) => {
			const previous = points[index - 1];
			const step = previous ? [`${x(index)},${y(previous.target)}`] : [];
			return [...step, `${x(index)},${y(point.target)}`];
		})
		.join(' ');

	return {
		measured,
		target,
		yTicks: [high, (high + low) / 2, low],
		gridLines: [0, height / 2, height]
	};
}

export function measuredSummary(points: readonly HistoryPoint[]) {
	const values = points.map((point) => point.measured).filter((value) => value !== null);
	if (values.length === 0) return null;
	return {
		min: Math.min(...values),
		max: Math.max(...values),
		average: values.reduce((sum, value) => sum + value, 0) / values.length
	};
}

export function lastMeasurementBeforeGap(
	points: readonly HistoryPoint[]
): HistoryPoint | undefined {
	const gapIndex = points.findIndex((point, index) => point.measured === null && index > 0);
	return gapIndex > 0 ? points[gapIndex - 1] : undefined;
}
