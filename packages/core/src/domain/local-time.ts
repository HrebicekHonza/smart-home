import type { EpochMillis, MinuteOfDay } from './units.ts';

export function localMinuteOfDay(at: EpochMillis): MinuteOfDay {
	const date = new Date(at);
	return date.getHours() * 60 + date.getMinutes();
}

export function atLocalMinute(day: EpochMillis, minute: MinuteOfDay): EpochMillis {
	const date = new Date(day);
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, minute).getTime();
}
