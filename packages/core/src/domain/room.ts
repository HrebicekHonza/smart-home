import type { Measurement } from './measurement.ts';
import type { Setpoint } from './setpoint.ts';
import type { Celsius } from './units.ts';

export type RoomId = string;

export type WindowState = 'open' | 'closed';

export type HeatingStatus = 'heating' | 'idle' | 'suspended';

export interface Room {
	readonly id: RoomId;
	readonly name: string;
}

export interface RoomState {
	readonly room: Room;
	readonly temperature: Measurement<Celsius> | null;
	readonly setpoint: Setpoint;
	readonly window: Measurement<WindowState> | null;
	readonly heating: Measurement<HeatingStatus> | null;
}
