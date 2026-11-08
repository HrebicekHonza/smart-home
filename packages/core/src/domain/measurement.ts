import { MINUTE_MS, type Celsius, type EpochMillis, type Percent } from './units.ts';

export interface Measurement {
	readonly at: EpochMillis;
	readonly temperature: Celsius | null;
	readonly humidity: Percent | null;
}

export const STALE_MEASUREMENT_AFTER_MS = 30 * MINUTE_MS;

export function isStale(
	measurement: Pick<Measurement, 'at'>,
	now: EpochMillis,
	maxAgeMs: number = STALE_MEASUREMENT_AFTER_MS
): boolean {
	return now - measurement.at > maxAgeMs;
}
