import type { EpochMillis } from '../domain/units.ts';

export interface Clock {
	now(): EpochMillis;
}

export const systemClock: Clock = { now: () => Date.now() };
