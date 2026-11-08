import type { Controller, Disturbances, RoomParams, SimOptions, SimResult } from './types.ts';

export function roomDerivative(
	room: RoomParams,
	T: number,
	Q: number,
	Tout: number,
	open: boolean
): number {
	const loss = (T - Tout) / room.R + (open ? (T - Tout) / room.Rwindow : 0);
	return (Q - loss) / room.C;
}

export function simulate(
	room: RoomParams,
	controller: Controller,
	dist: Disturbances,
	opts: SimOptions
): SimResult {
	const { dt, duration } = opts;
	if (!(dt > 0) || !(duration > 0)) throw new Error('dt and duration must be positive');
	const n = Math.round(duration / dt);
	const tauH = room.tauHeater ?? 0;
	const r: SimResult = { t: [], y: [], u: [], w: [], outdoor: [], window: [], heat: [] };

	controller.reset();
	let T = room.T0;
	let Q = 0;

	for (let k = 0; k <= n; k++) {
		const t = k * dt;
		const w = opts.setpoint(t);
		const Tout = dist.outdoorTemp(t);
		const open = dist.windowOpen(t);
		const u = Math.min(room.Pmax, Math.max(0, controller.step({ t, y: T, w, dt })));
		if (tauH <= 0) Q = u;

		r.t.push(t);
		r.y.push(T);
		r.u.push(u);
		r.w.push(w);
		r.outdoor.push(Tout);
		r.window.push(open);
		r.heat.push(Q);

		if (k === n) break;
		const dT = roomDerivative(room, T, Q, Tout, open);
		T += dt * dT;
		if (tauH > 0) Q += (dt * (u - Q)) / tauH;
	}
	return r;
}

export function steadyStateTemp(room: RoomParams, Q: number, Tout: number): number {
	return Tout + room.R * Q;
}

export function roomTimeConstant(room: RoomParams): number {
	return room.R * room.C;
}
