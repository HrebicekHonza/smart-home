import { describe, expect, it } from 'vitest';
import {
	ConstantPower,
	OnOffHysteresis,
	PIController,
	ProportionalValve,
	identifyStep,
	metrics,
	roomTimeConstant,
	simulate,
	steadyStateTemp,
	zieglerNicholsPI,
	type RoomParams
} from '../src/index.ts';

const room: RoomParams = { C: 600_000, R: 0.1, Rwindow: 0.01, Pmax: 800, T0: 0 };
const calm = { outdoorTemp: () => 0, windowOpen: () => false };
const HOUR = 3600;

const lastOf = (values: readonly number[]) => values.at(-1) ?? Number.NaN;

describe('room model', () => {
	it('settles at Tout + R·P under constant power', () => {
		const r = simulate(room, new ConstantPower(500), calm, {
			dt: 60,
			duration: 15 * roomTimeConstant(room),
			setpoint: () => 0
		});
		expect(Math.abs(lastOf(r.y) - steadyStateTemp(room, 500, 0))).toBeLessThan(0.01);
	});

	it('matches the analytic first-order response (63 % after one time constant)', () => {
		const tau = roomTimeConstant(room);
		const r = simulate(room, new ConstantPower(500), calm, {
			dt: 10,
			duration: tau,
			setpoint: () => 0
		});
		expect(Math.abs(lastOf(r.y) - 50 * (1 - Math.exp(-1)))).toBeLessThan(0.05);
	});

	it('cools faster with an open window', () => {
		const warm = { ...room, T0: 20 };
		const opts = { dt: 60, duration: HOUR, setpoint: () => 0 };
		const closed = simulate(warm, new ConstantPower(0), calm, opts);
		const open = simulate(
			warm,
			new ConstantPower(0),
			{ outdoorTemp: () => 0, windowOpen: () => true },
			opts
		);
		expect(lastOf(open.y)).toBeLessThan(lastOf(closed.y) - 1);
	});
});

describe('controllers', () => {
	it('keeps the on/off controller around the setpoint within its hysteresis', () => {
		const r = simulate({ ...room, T0: 20 }, new OnOffHysteresis(800, 0.5), calm, {
			dt: 30,
			duration: 24 * HOUR,
			setpoint: () => 21
		});
		const tail = r.y.slice(r.y.length / 2);
		expect(Math.min(...tail)).toBeGreaterThan(20.3);
		expect(Math.max(...tail)).toBeLessThan(21.7);
		expect(metrics(r, { band: 1 }).switches).toBeGreaterThan(2);
	});

	it('removes the steady-state error with a PI controller', () => {
		const r = simulate({ ...room, T0: 20 }, new PIController(400, 1800, 0, 800), calm, {
			dt: 30,
			duration: 24 * HOUR,
			setpoint: () => 21
		});
		expect(Math.abs(lastOf(r.y) - 21)).toBeLessThan(0.05);
	});

	it('limits overshoot after long saturation with anti-windup', () => {
		const cold = { ...room, T0: 10 };
		const opts = { dt: 30, duration: 24 * HOUR, setpoint: () => 21 };
		const withAntiWindup = metrics(
			simulate(cold, new PIController(400, 1800, 0, 800, true), calm, opts),
			{ band: 0.5 }
		);
		const without = metrics(
			simulate(cold, new PIController(400, 1800, 0, 800, false), calm, opts),
			{ band: 0.5 }
		);
		expect(withAntiWindup.overshoot).toBeLessThan(without.overshoot);
	});

	it('leaves a steady-state error with the thermostatic valve (P) and not with PI', () => {
		const opts = { dt: 30, duration: 48 * HOUR, setpoint: () => 21 };
		const valve = simulate({ ...room, T0: 20 }, new ProportionalValve(800, 2), calm, opts);
		const pi = simulate({ ...room, T0: 20 }, new PIController(400, 1800, 0, 800), calm, opts);
		expect(Math.abs(21 - lastOf(valve.y) - 21 / 41)).toBeLessThan(0.02);
		expect(Math.abs(21 - lastOf(pi.y))).toBeLessThan(0.05);
	});
});

describe('metrics and tuning', () => {
	it('integrates delivered energy: 500 W for 2 h is 1 kWh', () => {
		const r = simulate(room, new ConstantPower(500), calm, {
			dt: 60,
			duration: 2 * HOUR,
			setpoint: () => 0
		});
		expect(Math.abs(metrics(r, { band: 1 }).energyKWh - 1)).toBeLessThan(0.01);
	});

	it('rejects Ziegler–Nichols without dead time and tunes the room with a radiator', () => {
		expect(() => zieglerNicholsPI(identifyStep(room, 800, 0))).toThrow();
		const identification = identifyStep({ ...room, tauHeater: 900 }, 800, 0);
		expect(identification.Tu).toBeGreaterThan(0);
		expect(identification.Tn / identification.Tu).toBeGreaterThan(2.5);
		const { K, Ti } = zieglerNicholsPI(identification);
		expect(K).toBeGreaterThan(0);
		expect(Ti).toBeGreaterThan(0);
	});
});
