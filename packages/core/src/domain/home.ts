import type { Measurement } from './measurement.ts';
import type { ManualOverride } from './override.ts';
import type { DailySchedule } from './schedule.ts';
import type { Celsius, EpochMillis, Percent } from './units.ts';

export type RoomId = string;
export type DeviceId = string;

export type HomeMode = 'home' | 'away' | 'night';

export const AWAY_TARGET: Celsius = 17;

export type DeviceKind = 'trv' | 'climate-sensor' | 'window-contact' | 'light';

export interface Device {
	readonly id: DeviceId;
	readonly kind: DeviceKind;
	readonly name: string;
	readonly online: boolean;
	readonly lastSeenAt: EpochMillis | null;
	readonly battery?: Percent;
	readonly valve?: Percent;
	readonly on?: boolean;
}

export type WindowState =
	| { readonly state: 'open'; readonly since: EpochMillis }
	| { readonly state: 'closed' }
	| { readonly state: 'unknown' };

export interface Room {
	readonly id: RoomId;
	readonly name: string;
	readonly favorite: boolean;
	readonly photoUrl?: string;
	readonly schedule: DailySchedule;
	readonly devices: readonly Device[];
	readonly latest: Measurement | null;
	readonly window: WindowState;
	readonly override?: ManualOverride;
}

export interface Boiler {
	readonly running: boolean;
	readonly waterTemperature: Celsius | null;
	readonly waterSetpoint: Celsius;
	readonly waterMax: Celsius;
	readonly fuel: string;
	readonly lastRefuelAt?: EpochMillis;
}

export function offlineThermostats(room: Room): readonly Device[] {
	return room.devices.filter((device) => device.kind === 'trv' && !device.online);
}
