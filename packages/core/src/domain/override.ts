import { nextScheduleChange, type DailySchedule } from './schedule.ts';
import { HOUR_MS, type Celsius, type EpochMillis } from './units.ts';

export type OverrideDuration = '1h' | '2h' | 'next-change' | 'permanent';

export const DEFAULT_OVERRIDE_DURATION: OverrideDuration = '2h';

export interface ManualOverride {
	readonly target: Celsius;
	readonly until: EpochMillis | null;
	readonly createdAt: EpochMillis;
}

export function overrideUntil(
	duration: OverrideDuration,
	now: EpochMillis,
	schedule: DailySchedule
): EpochMillis | null {
	switch (duration) {
		case '1h':
			return now + HOUR_MS;
		case '2h':
			return now + 2 * HOUR_MS;
		case 'next-change':
			return nextScheduleChange(schedule, now)?.at ?? null;
		case 'permanent':
			return null;
	}
}

export function isOverrideActive(override: ManualOverride, now: EpochMillis): boolean {
	return override.until === null || override.until > now;
}
