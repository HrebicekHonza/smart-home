import { OnOffHysteresis, PIController, ProportionalValve } from './controllers.ts';
import { disturbances, setpointSchedule, sinusoidalOutdoor, windowSchedule } from './scenarios.ts';
import type { Controller, RoomParams } from './types.ts';

const HOUR = 3600;

export const REFERENCE_BAND = 0.5;
export const REFERENCE_DT = 30;
export const REFERENCE_DURATION = 24 * HOUR;
export const REFERENCE_VALVE_BAND = 2;
export const REFERENCE_HYSTERESIS = 0.5;

export const REFERENCE_SETPOINT_STEPS = [
	{ from: 0, value: 18 },
	{ from: 6, value: 21 },
	{ from: 22, value: 18 }
] as const;

export const REFERENCE_WINDOW_HOURS: readonly (readonly [number, number])[] = [[7, 7 + 10 / 60]];

export const REFERENCE_WEATHER = {
	base: { mean: -2, amplitude: 4, minAtHour: 5 },
	frost: { mean: -12, amplitude: 3, minAtHour: 5 }
} as const;

export type ReferenceWeather = keyof typeof REFERENCE_WEATHER;

export const referenceSetpoint = setpointSchedule(REFERENCE_SETPOINT_STEPS);

export function referenceDisturbances(weather: ReferenceWeather) {
	const { mean, amplitude, minAtHour } = REFERENCE_WEATHER[weather];
	return disturbances(
		sinusoidalOutdoor(mean, amplitude, minAtHour),
		windowSchedule(REFERENCE_WINDOW_HOURS)
	);
}

export const CONTROLLER_KINDS = ['valve', 'thermostat', 'pi', 'piWithoutAntiWindup'] as const;

export type ControllerKind = (typeof CONTROLLER_KINDS)[number];

export interface ControllerSettings {
	readonly valveBand: number;
	readonly hysteresis: number;
	readonly K: number;
	readonly Ti: number;
}

export function createController(
	kind: ControllerKind,
	room: RoomParams,
	settings: ControllerSettings
): Controller {
	switch (kind) {
		case 'valve':
			return new ProportionalValve(room.Pmax, settings.valveBand);
		case 'thermostat':
			return new OnOffHysteresis(room.Pmax, settings.hysteresis);
		case 'pi':
			return new PIController(settings.K, settings.Ti, 0, room.Pmax, true);
		case 'piWithoutAntiWindup':
			return new PIController(settings.K, settings.Ti, 0, room.Pmax, false);
	}
}
