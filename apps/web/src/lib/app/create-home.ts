import { systemClock } from '@doma/core';
import { DemoGateway, type DemoScenario } from '#lib/adapters/demo/demo-gateway.ts';
import { DEMO_ROOM_IDS } from '#lib/adapters/demo/seed.ts';
import { HomeState } from '#lib/state/home-state.svelte.ts';

const SCENARIOS: readonly DemoScenario[] = ['normal', 'offline', 'loading'];

export function createHome(search: string): HomeState {
	const requested = new URLSearchParams(search).get('demo');
	const scenario = SCENARIOS.find((candidate) => candidate === requested) ?? 'normal';
	return new HomeState(new DemoGateway({ clock: systemClock, scenario }), systemClock);
}

export const knownRoomIds: readonly string[] = DEMO_ROOM_IDS;
