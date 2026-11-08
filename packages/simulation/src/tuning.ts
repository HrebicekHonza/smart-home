import { ConstantPower } from './controllers.ts';
import { at } from './series.ts';
import { simulate } from './simulate.ts';
import type { RoomParams } from './types.ts';

export interface StepIdentification {
	readonly gain: number;
	readonly Tu: number;
	readonly Tn: number;
	readonly slope: number;
}

export interface StepResponse extends StepIdentification {
	readonly t: readonly number[];
	readonly y: readonly number[];
}

export function identifyStep(
	room: RoomParams,
	deltaP: number,
	Tout: number,
	dt = 10
): StepResponse {
	const start: RoomParams = { ...room, T0: Tout };
	const duration = Math.max(10 * room.R * room.C, 3600);
	const r = simulate(
		start,
		new ConstantPower(deltaP),
		{ outdoorTemp: () => Tout, windowOpen: () => false },
		{ dt, duration, setpoint: () => 0 }
	);
	const y0 = at(r.y, 0);
	const yInf = Tout + room.R * deltaP;

	let kMax = 1;
	let sMax = -Infinity;
	for (let k = 1; k < r.y.length; k++) {
		const s = (at(r.y, k) - at(r.y, k - 1)) / dt;
		if (s > sMax) {
			sMax = s;
			kMax = k;
		}
	}
	const tI = (at(r.t, kMax) + at(r.t, kMax - 1)) / 2;
	const yI = (at(r.y, kMax) + at(r.y, kMax - 1)) / 2;
	const tAtY0 = tI - (yI - y0) / sMax;
	const tAtYInf = tI + (yInf - yI) / sMax;
	const noInflection = kMax === 1;

	return {
		gain: (yInf - y0) / deltaP,
		Tu: noInflection ? 0 : Math.max(0, tAtY0),
		Tn: tAtYInf - tAtY0,
		slope: sMax,
		t: r.t,
		y: r.y
	};
}

export function zieglerNicholsPI(id: StepIdentification): { K: number; Ti: number } {
	if (id.Tu <= 0) {
		throw new Error('Dead time is zero: the Ziegler–Nichols method needs a delayed response.');
	}
	return { K: (0.9 * id.Tn) / (id.gain * id.Tu), Ti: 3.33 * id.Tu };
}
