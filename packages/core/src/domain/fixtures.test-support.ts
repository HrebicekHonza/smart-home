import type { Room } from './home.ts';
import type { DailySchedule } from './schedule.ts';
import { MINUTE_MS, type EpochMillis } from './units.ts';

export const at = (hours: number, minutes = 0, day = 8): EpochMillis =>
	new Date(2026, 10, day, hours, minutes).getTime();

export const dayNight = (night: number, day: number): DailySchedule => [
	{ from: 0, to: 6 * 60, target: night },
	{ from: 6 * 60, to: 22 * 60, target: day },
	{ from: 22 * 60, to: 24 * 60, target: night }
];

export function room(overrides: Partial<Room> = {}, now: EpochMillis = at(8, 24)): Room {
	return {
		id: 'living-room',
		name: 'Obývák',
		favorite: true,
		schedule: dayNight(19, 22),
		devices: [
			{
				id: 'trv-1',
				kind: 'trv',
				name: 'Hlavice',
				online: true,
				lastSeenAt: now - MINUTE_MS
			}
		],
		latest: { at: now - 2 * MINUTE_MS, temperature: 20.6, humidity: 48 },
		window: { state: 'closed' },
		...overrides
	};
}
