import { atLocalMinute, localMinuteOfDay } from './local-time.ts';
import { MINUTES_PER_DAY, type Celsius, type EpochMillis, type MinuteOfDay } from './units.ts';

export interface ScheduleSegment {
	readonly from: MinuteOfDay;
	readonly to: MinuteOfDay;
	readonly target: Celsius;
}

export type DailySchedule = readonly [ScheduleSegment, ...ScheduleSegment[]];

export interface ScheduleChange {
	readonly at: EpochMillis;
	readonly target: Celsius;
}

export function segmentIndexAt(schedule: DailySchedule, minute: MinuteOfDay): number {
	const index = schedule.findIndex((segment) => minute >= segment.from && minute < segment.to);
	return index === -1 ? schedule.length - 1 : index;
}

export function segmentAt(schedule: DailySchedule, minute: MinuteOfDay): ScheduleSegment {
	return schedule[segmentIndexAt(schedule, minute)] ?? schedule[0];
}

export function nightTarget(schedule: DailySchedule): Celsius {
	return segmentAt(schedule, 0).target;
}

export function warmestTarget(schedule: DailySchedule): Celsius {
	return Math.max(...schedule.map((segment) => segment.target));
}

export function nextScheduleChange(
	schedule: DailySchedule,
	now: EpochMillis
): ScheduleChange | null {
	const startIndex = segmentIndexAt(schedule, localMinuteOfDay(now));
	const current = schedule[startIndex] ?? schedule[0];

	for (let offset = 1; offset <= schedule.length; offset++) {
		const index = (startIndex + offset) % schedule.length;
		const candidate = schedule[index] ?? schedule[0];
		if (candidate.target !== current.target) {
			const dayOffset = index <= startIndex ? MINUTES_PER_DAY : 0;
			return { at: atLocalMinute(now, candidate.from + dayOffset), target: candidate.target };
		}
	}
	return null;
}
