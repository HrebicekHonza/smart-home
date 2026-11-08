import {
	CONTROLLER_KINDS,
	REFERENCE_BAND,
	REFERENCE_DT,
	REFERENCE_DURATION,
	REFERENCE_HYSTERESIS,
	REFERENCE_VALVE_BAND,
	createController,
	identifyStep,
	metrics,
	referenceDisturbances,
	referenceSetpoint,
	simulate,
	studyRoom,
	zieglerNicholsPI,
	type ReferenceWeather
} from '@doma/simulation';
import { describe, expect, it } from 'vitest';
import { SimulatorState } from './simulator-state.svelte.ts';

function referenceMetrics(weather: ReferenceWeather) {
	const room = studyRoom.room;
	const tuning = zieglerNicholsPI(identifyStep(room, room.Pmax, 0, 10));
	const settings = { valveBand: REFERENCE_VALVE_BAND, hysteresis: REFERENCE_HYSTERESIS, ...tuning };
	return Object.fromEntries(
		CONTROLLER_KINDS.map((kind) => [
			kind,
			metrics(
				simulate(room, createController(kind, room, settings), referenceDisturbances(weather), {
					dt: REFERENCE_DT,
					duration: REFERENCE_DURATION,
					setpoint: referenceSetpoint
				}),
				{ band: REFERENCE_BAND }
			)
		])
	);
}

const golden = { base: referenceMetrics('base'), frost: referenceMetrics('frost') };

describe('SimulatorState', () => {
	it('starts with the reference scenario covered by the golden tests', () => {
		const state = new SimulatorState();

		expect(state.runs.map((run) => run.kind)).toEqual([
			'valve',
			'thermostat',
			'pi',
			'piWithoutAntiWindup'
		]);
		for (const run of state.runs) {
			expect(run.metrics).toEqual(golden.base[run.kind]);
		}
	});

	it('reproduces the frost scenario when that weather is selected', () => {
		const state = new SimulatorState();
		state.weather = 'frost';

		for (const run of state.runs) {
			expect(run.metrics).toEqual(golden.frost[run.kind]);
		}
	});

	it('only simulates the selected controllers', () => {
		const state = new SimulatorState();
		state.enabled.valve = false;
		state.enabled.piWithoutAntiWindup = false;

		expect(state.runs.map((run) => run.kind)).toEqual(['thermostat', 'pi']);
	});

	it('skips PI controllers when the room has no dead time for Ziegler–Nichols tuning', () => {
		const state = new SimulatorState();
		state.room.tauHeater = 0;

		expect(state.piUnavailable).toBe(true);
		expect(state.runs.map((run) => run.kind)).toEqual(['valve', 'thermostat']);
	});

	it('uses manual PI parameters when automatic tuning is off', () => {
		const state = new SimulatorState();
		state.room.tauHeater = 0;
		state.autoTuning = false;
		state.manualK = 400;
		state.manualTi = 1800;

		expect(state.runs.map((run) => run.kind)).toContain('pi');
	});

	it('does not simulate an invalid room', () => {
		const state = new SimulatorState();
		state.room.R = 0;

		expect(state.params).toBeNull();
		expect(state.runs).toEqual([]);
	});

	it('returns to the reference after changes', () => {
		const state = new SimulatorState();
		state.room.Pmax = 1500;
		state.setback = false;

		state.resetToReference();

		expect(state.runs[2]?.metrics).toEqual(golden.base.pi);
	});
});
