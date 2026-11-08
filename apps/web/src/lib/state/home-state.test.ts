import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DemoGateway, type DemoGatewayOptions } from '#lib/adapters/demo/demo-gateway.ts';
import { HomeState } from './home-state.svelte.ts';

const now = new Date(2026, 10, 8, 8, 24).getTime();
const clock = { now: () => now };

let state: HomeState;
let stop: () => void;

async function startHome(options: Partial<DemoGatewayOptions> = {}) {
	state = new HomeState(
		new DemoGateway({ clock, delay: () => Promise.resolve(), ...options }),
		clock
	);
	stop = state.start();
	await Promise.resolve();
	return state;
}

function room(id: string) {
	const found = state.room(id);
	if (!found) throw new Error(`Missing room ${id}`);
	return found;
}

beforeEach(() => {
	stop = () => undefined;
});

afterEach(() => stop());

describe('HomeState target changes', () => {
	it('keeps the confirmed target while only the draft changes', async () => {
		await startHome();
		state.adjustDraft(room('obyvak'), 1);

		expect(state.draft(room('obyvak'))).toBe(22.5);
		expect(state.target(room('obyvak')).target).toBe(22);
	});

	it('keeps the original target and the draft when the command fails', async () => {
		await startHome();
		state.adjustDraft(room('obyvak'), 1);

		await state.submitTarget(room('obyvak'));

		expect(state.targetCommand('obyvak')).toEqual({ status: 'failed', reason: 'partial' });
		expect(state.target(room('obyvak')).target).toBe(22);
		expect(state.draft(room('obyvak'))).toBe(22.5);
	});

	it('applies the target only after confirmation and clears the draft', async () => {
		await startHome({ failFirstTargetChange: false });
		state.adjustDraft(room('obyvak'), 1);

		await state.submitTarget(room('obyvak'));

		expect(state.targetCommand('obyvak')).toEqual({ status: 'confirmed', target: 22.5 });
		expect(state.target(room('obyvak'))).toMatchObject({ target: 22.5, source: 'manual' });
		expect(state.drafts).not.toHaveProperty('obyvak');
		expect(state.toast?.message).toBe('Obývák: cíl 22,5 °C nastaven');
	});

	it('does not send an unchanged target', async () => {
		await startHome({ failFirstTargetChange: false });
		await state.submitTarget(room('obyvak'));
		expect(state.targetCommand('obyvak').status).toBe('idle');
	});

	it('does not send commands to a room with an offline thermostat', async () => {
		await startHome({ failFirstTargetChange: false });
		expect(state.canControl(room('toaleta'))).toBe(false);
	});

	it('disables all control while the home server is unreachable', async () => {
		await startHome({ scenario: 'offline' });
		expect(state.online).toBe(false);
		expect(state.canControl(room('obyvak'))).toBe(false);
	});
});

describe('HomeState mode', () => {
	it('switches the whole home and announces it', async () => {
		await startHome();
		const switching = state.setMode('night');
		expect(state.pendingMode).toBe('night');

		await switching;

		expect(state.pendingMode).toBeNull();
		expect(state.mode).toBe('night');
		expect(state.toast?.message).toBe('Režim Noc platí pro celou domácnost');
	});
});
