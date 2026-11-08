import { describe, expect, it } from 'vitest';
import { at, dayNight } from './fixtures.test-support.ts';
import { nextScheduleChange, nightTarget, segmentAt, type DailySchedule } from './schedule.ts';

describe('segmentAt', () => {
	const schedule = dayNight(19, 22);

	it('returns the segment covering the minute, with the end exclusive', () => {
		expect(segmentAt(schedule, 6 * 60 - 1).target).toBe(19);
		expect(segmentAt(schedule, 6 * 60).target).toBe(22);
		expect(segmentAt(schedule, 22 * 60).target).toBe(19);
	});
});

describe('nightTarget', () => {
	it('is the target scheduled at midnight', () => {
		expect(nightTarget(dayNight(18, 21))).toBe(18);
	});
});

describe('nextScheduleChange', () => {
	const schedule = dayNight(19, 22);

	it('returns the start of the next segment with a different target', () => {
		expect(nextScheduleChange(schedule, at(8, 24))).toEqual({ at: at(22), target: 19 });
	});

	it('skips adjacent segments with the same target across midnight', () => {
		expect(nextScheduleChange(schedule, at(23, 0))).toEqual({ at: at(6, 0, 9), target: 22 });
	});

	it('returns null when the whole day has one target', () => {
		const flat: DailySchedule = [{ from: 0, to: 24 * 60, target: 20 }];
		expect(nextScheduleChange(flat, at(12))).toBeNull();
	});
});
