import { at } from './series.ts';
import type { Disturbances } from './types.ts';

const HOUR = 3600;

export interface SetpointStep {
	readonly from: number;
	readonly value: number;
}

export function sinusoidalOutdoor(
	mean: number,
	amplitude: number,
	minAtHour = 5
): (t: number) => number {
	return (t) => mean - amplitude * Math.cos((2 * Math.PI * (t / HOUR - minAtHour)) / 24);
}

export function windowSchedule(
	intervalsHours: readonly (readonly [number, number])[]
): (t: number) => boolean {
	return (t) => intervalsHours.some(([a, b]) => t >= a * HOUR && t < b * HOUR);
}

export function setpointSchedule(steps: readonly SetpointStep[]): (t: number) => number {
	const first = at(steps, 0).value;
	return (t) => {
		let v = first;
		for (const s of steps) if (t >= s.from * HOUR) v = s.value;
		return v;
	};
}

export function disturbances(
	outdoorTemp: (t: number) => number,
	windowOpen: (t: number) => boolean
): Disturbances {
	return { outdoorTemp, windowOpen };
}
