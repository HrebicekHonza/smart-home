import { AWAY_TARGET, type HomeMode, type Room } from './home.ts';
import { localMinuteOfDay } from './local-time.ts';
import { isOverrideActive } from './override.ts';
import { nextScheduleChange, nightTarget, segmentAt } from './schedule.ts';
import type { Celsius, EpochMillis } from './units.ts';

export type TargetSource = 'manual' | 'mode-away' | 'mode-night' | 'schedule';

export type TargetValidity = EpochMillis | 'mode-change' | 'permanent';

export interface EffectiveTarget {
	readonly target: Celsius;
	readonly source: TargetSource;
	readonly validUntil: TargetValidity;
}

export function effectiveTarget(room: Room, mode: HomeMode, now: EpochMillis): EffectiveTarget {
	if (room.override && isOverrideActive(room.override, now)) {
		return {
			target: room.override.target,
			source: 'manual',
			validUntil: room.override.until ?? 'permanent'
		};
	}
	if (mode === 'away') {
		return { target: AWAY_TARGET, source: 'mode-away', validUntil: 'mode-change' };
	}
	if (mode === 'night') {
		return { target: nightTarget(room.schedule), source: 'mode-night', validUntil: 'mode-change' };
	}
	return {
		target: segmentAt(room.schedule, localMinuteOfDay(now)).target,
		source: 'schedule',
		validUntil: nextScheduleChange(room.schedule, now)?.at ?? 'permanent'
	};
}
