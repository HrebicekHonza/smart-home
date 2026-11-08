import type { Controller, ControllerInput } from './types.ts';

const stateless = (): void => undefined;

export class OnOffHysteresis implements Controller {
	readonly name: string;
	readonly #power: number;
	readonly #hysteresis: number;
	readonly #startOn: boolean;
	#on: boolean;

	constructor(power: number, hysteresis: number, startOn = false) {
		this.#power = power;
		this.#hysteresis = hysteresis;
		this.#startOn = startOn;
		this.#on = startOn;
		this.name = `On/off with hysteresis (±${hysteresis} K)`;
	}

	reset(): void {
		this.#on = this.#startOn;
	}

	step({ y, w }: ControllerInput): number {
		if (y < w - this.#hysteresis) this.#on = true;
		else if (y > w + this.#hysteresis) this.#on = false;
		return this.#on ? this.#power : 0;
	}
}

export class PIController implements Controller {
	readonly name: string;
	readonly K: number;
	readonly Ti: number;
	readonly #uMin: number;
	readonly #uMax: number;
	readonly #antiWindup: boolean;
	#integral = 0;

	constructor(K: number, Ti: number, uMin: number, uMax: number, antiWindup = true) {
		this.K = K;
		this.Ti = Ti;
		this.#uMin = uMin;
		this.#uMax = uMax;
		this.#antiWindup = antiWindup;
		this.name = antiWindup ? 'PI with anti-windup' : 'PI without anti-windup';
	}

	reset(): void {
		this.#integral = 0;
	}

	step({ y, w, dt }: ControllerInput): number {
		const e = w - y;
		const candidate = this.#integral + e * dt;
		const uUnsat = this.K * (e + candidate / this.Ti);
		const saturatedHigh = uUnsat > this.#uMax && e > 0;
		const saturatedLow = uUnsat < this.#uMin && e < 0;
		if (!this.#antiWindup || !(saturatedHigh || saturatedLow)) this.#integral = candidate;
		const u = this.K * (e + this.#integral / this.Ti);
		return Math.min(this.#uMax, Math.max(this.#uMin, u));
	}
}

export class ProportionalValve implements Controller {
	readonly name: string;
	readonly reset = stateless;
	readonly #power: number;
	readonly #band: number;

	constructor(power: number, band = 2) {
		this.#power = power;
		this.#band = band;
		this.name = `Thermostatic valve, P controller (Xp = ${band} K)`;
	}

	step({ y, w }: ControllerInput): number {
		const opening = Math.min(1, Math.max(0, (w - y) / this.#band));
		return this.#power * opening;
	}
}

export class ConstantPower implements Controller {
	readonly name = 'Constant power';
	readonly reset = stateless;
	readonly #power: number;

	constructor(power: number) {
		this.#power = power;
	}

	step(): number {
		return this.#power;
	}
}
