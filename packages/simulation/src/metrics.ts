import { at } from './series.ts';
import type { Metrics, SimResult } from './types.ts';

export function metrics(r: SimResult, opts: { readonly band: number }): Metrics {
	const n = r.t.length;
	if (n < 2) throw new Error('Simulation result is too short');
	const { band } = opts;
	let energyJ = 0;
	let outside = 0;
	let below = 0;
	let overshoot = 0;
	let switches = 0;
	let absErr = 0;
	let afterDecrease = false;

	for (let k = 0; k < n - 1; k++) {
		const dt = at(r.t, k + 1) - at(r.t, k);
		const w = at(r.w, k);
		if (k > 0 && w !== at(r.w, k - 1)) afterDecrease = w < at(r.w, k - 1);
		energyJ += at(r.heat, k) * dt;
		const e = at(r.y, k) - w;
		if (Math.abs(e) > band) outside += dt;
		if (e < -band) below += dt;
		absErr += Math.abs(e) * dt;
		if (!afterDecrease) overshoot = Math.max(overshoot, e);
		if (k > 0 && at(r.u, k - 1) <= 0 && at(r.u, k) > 0) switches++;
	}
	if (at(r.u, 0) > 0) switches++;

	return {
		energyKWh: energyJ / 3.6e6,
		minutesOutsideBand: outside / 60,
		minutesBelowBand: below / 60,
		overshoot,
		settlingTime: settlingTime(r, band),
		switches,
		meanAbsError: absErr / (at(r.t, n - 1) - at(r.t, 0))
	};
}

function settlingTime(r: SimResult, band: number): number | null {
	const w0 = at(r.w, 0);
	let end = r.t.length - 1;
	for (let k = 1; k < r.t.length; k++) {
		if (at(r.w, k) !== w0) {
			end = k - 1;
			break;
		}
	}
	let lastOutside = -1;
	for (let k = 0; k <= end; k++) {
		if (Math.abs(at(r.y, k) - w0) > band) lastOutside = k;
	}
	if (lastOutside === end) return null;
	return at(r.t, lastOutside + 1) - at(r.t, 0);
}
