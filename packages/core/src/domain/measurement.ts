import type { EpochMillis } from './units.ts';

export interface Measurement<T> {
	readonly value: T;
	readonly measuredAt: EpochMillis;
}

export const DEFAULT_MAX_MEASUREMENT_AGE_MS = 5 * 60 * 1000;

export function isStale(
	measurement: Measurement<unknown>,
	now: EpochMillis,
	maxAgeMs: number = DEFAULT_MAX_MEASUREMENT_AGE_MS
): boolean {
	return now - measurement.measuredAt > maxAgeMs;
}
