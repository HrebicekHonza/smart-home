import {
	HOUR_MS,
	MINUTE_MS,
	atLocalMinute,
	effectiveTarget,
	type DailySchedule,
	type Device,
	type EpochMillis,
	type HomeEvent,
	type HomeSnapshot,
	type Percent,
	type Room,
	type WindowState
} from '@doma/core';

const hours = (value: number) => Math.round(value * 60);

const dayNight = (night: number, day: number): DailySchedule => [
	{ from: 0, to: hours(6), target: night },
	{ from: hours(6), to: hours(22), target: day },
	{ from: hours(22), to: hours(24), target: night }
];

interface RoomSeed {
	readonly id: string;
	readonly name: string;
	readonly favorite: boolean;
	readonly schedule: DailySchedule;
	readonly offsetFromTarget: number | null;
	readonly humidity: Percent | null;
	readonly measuredMinutesAgo: number;
	readonly window?: 'open' | 'closed';
	readonly devices: (now: EpochMillis) => Device[];
}

const thermostat = (
	id: string,
	name: string,
	valve: Percent,
	battery: Percent,
	now: EpochMillis
): Device => ({
	id,
	kind: 'trv',
	name,
	online: true,
	lastSeenAt: now - MINUTE_MS,
	valve,
	battery
});

const climateSensor = (id: string, minutesAgo: number, now: EpochMillis): Device => ({
	id,
	kind: 'climate-sensor',
	name: 'Teplota a vlhkost',
	online: true,
	lastSeenAt: now - minutesAgo * MINUTE_MS
});

const windowContact = (id: string, now: EpochMillis): Device => ({
	id,
	kind: 'window-contact',
	name: 'Okenní kontakt',
	online: true,
	lastSeenAt: now - MINUTE_MS
});

const light = (id: string, name: string, on: boolean, now: EpochMillis): Device => ({
	id,
	kind: 'light',
	name,
	online: true,
	lastSeenAt: now - MINUTE_MS,
	on
});

export const WINDOW_OPEN_MINUTES = 12;
export const STALE_MINUTES = 47;
export const OFFLINE_MINUTES = 192;

const ROOMS: readonly RoomSeed[] = [
	{
		id: 'obyvak',
		name: 'Obývák',
		favorite: true,
		schedule: dayNight(19, 22),
		offsetFromTarget: -1.4,
		humidity: 48,
		measuredMinutesAgo: 2,
		window: 'closed',
		devices: (now) => [
			thermostat('trv-obyvak-01', 'Hlavice u okna', 60, 81, now),
			thermostat('trv-obyvak-02', 'Hlavice u gauče', 55, 77, now),
			climateSensor('th-obyvak-01', 2, now),
			windowContact('win-obyvak-01', now)
		]
	},
	{
		id: 'pokoj-chodba',
		name: 'Pokoj (chodba)',
		favorite: true,
		schedule: dayNight(18, 21),
		offsetFromTarget: 0.2,
		humidity: 44,
		measuredMinutesAgo: 1,
		devices: (now) => [
			thermostat('trv-pokoj-chodba-01', 'Hlavice', 10, 64, now),
			climateSensor('th-pokoj-chodba-01', 1, now),
			light('light-pokoj-chodba-01', 'Stolní lampa', false, now)
		]
	},
	{
		id: 'loznice',
		name: 'Ložnice',
		favorite: true,
		schedule: [
			{ from: 0, to: hours(6), target: 18 },
			{ from: hours(6), to: hours(8), target: 20 },
			{ from: hours(8), to: hours(21), target: 19 },
			{ from: hours(21), to: hours(24), target: 18 }
		],
		offsetFromTarget: 0.1,
		humidity: 52,
		measuredMinutesAgo: 3,
		devices: (now) => [
			thermostat('trv-loznice-01', 'Hlavice', 5, 70, now),
			climateSensor('th-loznice-01', 3, now)
		]
	},
	{
		id: 'koupelna',
		name: 'Koupelna',
		favorite: true,
		schedule: [
			{ from: 0, to: hours(5.5), target: 19 },
			{ from: hours(5.5), to: hours(9), target: 23 },
			{ from: hours(9), to: hours(18), target: 20 },
			{ from: hours(18), to: hours(22), target: 23 },
			{ from: hours(22), to: hours(24), target: 19 }
		],
		offsetFromTarget: -1.1,
		humidity: 61,
		measuredMinutesAgo: 1,
		window: 'open',
		devices: (now) => [
			thermostat('trv-koupelna-01', 'Hlavice', 0, 72, now),
			climateSensor('th-koupelna-01', 1, now),
			windowContact('win-koupelna-01', now),
			light('light-koupelna-01', 'Stropní světlo', true, now)
		]
	},
	{
		id: 'kuchyne',
		name: 'Kuchyně',
		favorite: false,
		schedule: dayNight(18, 20.5),
		offsetFromTarget: -0.3,
		humidity: 50,
		measuredMinutesAgo: 2,
		devices: (now) => [
			thermostat('trv-kuchyne-01', 'Hlavice', 30, 88, now),
			climateSensor('th-kuchyne-01', 2, now)
		]
	},
	{
		id: 'pokoj-kuchyn',
		name: 'Pokoj (kuchyň)',
		favorite: false,
		schedule: dayNight(18, 20),
		offsetFromTarget: -0.2,
		humidity: 47,
		measuredMinutesAgo: 4,
		devices: (now) => [thermostat('trv-pokoj-kuchyn-01', 'Hlavice', 20, 59, now)]
	},
	{
		id: 'toaleta',
		name: 'Toaleta',
		favorite: false,
		schedule: dayNight(18, 20),
		offsetFromTarget: null,
		humidity: null,
		measuredMinutesAgo: OFFLINE_MINUTES,
		devices: (now) => [
			{
				id: 'trv-toaleta-01',
				kind: 'trv',
				name: 'Hlavice',
				online: false,
				lastSeenAt: now - OFFLINE_MINUTES * MINUTE_MS,
				battery: 12
			}
		]
	},
	{
		id: 'chodba',
		name: 'Chodba',
		favorite: false,
		schedule: dayNight(17, 18),
		offsetFromTarget: 0.4,
		humidity: 49,
		measuredMinutesAgo: STALE_MINUTES,
		devices: (now) => [
			thermostat('trv-chodba-01', 'Hlavice', 0, 41, now),
			climateSensor('th-chodba-01', STALE_MINUTES, now)
		]
	}
];

export const DEMO_ROOM_IDS: readonly string[] = ROOMS.map((room) => room.id);

export function seedDemoHome(now: EpochMillis): HomeSnapshot {
	return {
		connection: { status: 'online' },
		mode: 'home',
		rooms: ROOMS.map((seed) => seedRoom(seed, now)),
		boiler: {
			running: true,
			waterTemperature: 69.5,
			waterSetpoint: 70,
			waterMax: 85,
			fuel: 'Ořech 2',
			lastRefuelAt: now - 74 * MINUTE_MS
		},
		events: seedEvents(now)
	};
}

function seedRoom(seed: RoomSeed, now: EpochMillis): Room {
	const base: Room = {
		id: seed.id,
		name: seed.name,
		favorite: seed.favorite,
		schedule: seed.schedule,
		devices: seed.devices(now),
		latest: null,
		window: seedWindow(seed, now)
	};
	if (seed.offsetFromTarget === null) return base;

	const target = effectiveTarget(base, 'home', now).target;
	return {
		...base,
		latest: {
			at: now - seed.measuredMinutesAgo * MINUTE_MS,
			temperature: Math.round((target + seed.offsetFromTarget) * 10) / 10,
			humidity: seed.humidity
		}
	};
}

function seedWindow(seed: RoomSeed, now: EpochMillis): WindowState {
	if (seed.window === 'open') {
		return { state: 'open', since: now - WINDOW_OPEN_MINUTES * MINUTE_MS };
	}
	return seed.window === 'closed' ? { state: 'closed' } : { state: 'unknown' };
}

function lastOccurrence(now: EpochMillis, minute: number): EpochMillis {
	const today = atLocalMinute(now, minute);
	return today <= now ? today : today - 24 * HOUR_MS;
}

function seedEvents(now: EpochMillis): HomeEvent[] {
	const ago = (minutes: number) => now - minutes * MINUTE_MS;
	const events: HomeEvent[] = [
		{ id: 'seed-window', at: ago(WINDOW_OPEN_MINUTES), kind: 'window-opened', roomId: 'koupelna' },
		{ id: 'seed-fuel', at: ago(74), kind: 'fuel-refilled' },
		{
			id: 'seed-day',
			at: lastOccurrence(now, 6 * 60),
			kind: 'schedule-applied',
			period: 'day',
			roomCount: 6
		},
		{
			id: 'seed-offline',
			at: ago(OFFLINE_MINUTES),
			kind: 'device-offline',
			roomId: 'toaleta',
			deviceId: 'trv-toaleta-01'
		},
		{
			id: 'seed-night',
			at: lastOccurrence(now, 22 * 60),
			kind: 'schedule-applied',
			period: 'night',
			roomCount: 8
		}
	];
	return events.sort((a, b) => b.at - a.at);
}
