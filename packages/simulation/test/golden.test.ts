import { describe, expect, it } from 'vitest';
import {
	CONTROLLER_KINDS,
	OnOffHysteresis,
	PIController,
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
	roomTimeConstant,
	simulate,
	studyRoom,
	zieglerNicholsPI,
	type Metrics,
	type ReferenceWeather
} from '../src/index.ts';
import goldenJson from './golden.json' with { type: 'json' };

const TOLERANCE = 1e-6;

interface Golden {
	room: Record<string, number>;
	tau: number;
	tauOpen: number;
	identification: { gain: number; Tu: number; Tn: number; slope: number };
	zieglerNichols: { K: number; Ti: number };
	band: number;
	base: Record<string, Metrics>;
	frost: Record<string, Metrics>;
	hysteresis: (Metrics & { h: number })[];
	eulerStep: { dt: number; energyKWh: number; yEnd: number; yMin: number }[];
}

const golden = goldenJson as Golden;

const room = studyRoom.room;
const identification = identifyStep(room, room.Pmax, 0, 10);
const tuning = zieglerNicholsPI(identification);
const settings = {
	valveBand: REFERENCE_VALVE_BAND,
	hysteresis: REFERENCE_HYSTERESIS,
	K: tuning.K,
	Ti: tuning.Ti
};

function expectClose(actual: number | null, expected: number | null) {
	if (expected === null || actual === null) {
		expect(actual).toBe(expected);
		return;
	}
	expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

function expectMetrics(actual: Metrics, expected: Metrics) {
	for (const key of Object.keys(expected) as (keyof Metrics)[]) {
		expectClose(actual[key], expected[key]);
	}
}

function run(
	weather: ReferenceWeather,
	controller: Parameters<typeof simulate>[1],
	dt = REFERENCE_DT
) {
	return simulate({ ...room, T0: 18 }, controller, referenceDisturbances(weather), {
		dt,
		duration: REFERENCE_DURATION,
		setpoint: referenceSetpoint
	});
}

describe('golden values from the semester paper', () => {
	it('derives the reference room parameters', () => {
		for (const [key, value] of Object.entries(golden.room)) {
			expectClose(room[key as keyof typeof room] ?? null, value);
		}
		expectClose(roomTimeConstant(room), golden.tau);
		expectClose(room.C / (1 / room.R + 1 / room.Rwindow), golden.tauOpen);
		expect(REFERENCE_BAND).toBe(golden.band);
	});

	it('identifies the step response and tunes the PI controller', () => {
		expectClose(identification.gain, golden.identification.gain);
		expectClose(identification.Tu, golden.identification.Tu);
		expectClose(identification.Tn, golden.identification.Tn);
		expectClose(identification.slope, golden.identification.slope);
		expectClose(tuning.K, golden.zieglerNichols.K);
		expectClose(tuning.Ti, golden.zieglerNichols.Ti);
	});

	describe.each(['base', 'frost'] as const)('%s weather', (weather) => {
		it.each(CONTROLLER_KINDS)('reproduces the metrics of %s', (kind) => {
			const expected = golden[weather][kind];
			if (!expected) throw new Error(`Missing golden metrics for ${weather}/${kind}`);
			const result = run(weather, createController(kind, room, settings));
			expectMetrics(metrics(result, { band: REFERENCE_BAND }), expected);
		});
	});

	it.each(golden.hysteresis)(
		'reproduces the thermostat with hysteresis $h K',
		({ h, ...expected }) => {
			const result = run('base', new OnOffHysteresis(room.Pmax, h));
			expectMetrics(metrics(result, { band: REFERENCE_BAND }), expected);
		}
	);

	it.each(golden.eulerStep)('reproduces the Euler step study for dt = $dt s', (expected) => {
		const result = run(
			'base',
			new PIController(tuning.K, tuning.Ti, 0, room.Pmax, true),
			expected.dt
		);
		expectClose(metrics(result, { band: REFERENCE_BAND }).energyKWh, expected.energyKWh);
		expectClose(result.y.at(-1) ?? null, expected.yEnd);
		expectClose(Math.min(...result.y), expected.yMin);
	});
});
