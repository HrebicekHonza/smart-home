import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const source = process.argv[2];
if (!source) {
	console.error('Usage: pnpm --filter @doma/simulation golden:update <path to vysledky.json>');
	process.exit(1);
}

const results = JSON.parse(readFileSync(source, 'utf8'));
const controllers = {
	hlavice: 'valve',
	termostat: 'thermostat',
	pi: 'pi',
	piBezAW: 'piWithoutAntiWindup'
};
const metricsOf = (runs) =>
	Object.fromEntries(
		Object.entries(controllers).map(([original, kind]) => [kind, runs[original].metrics])
	);

const golden = {
	room: results.room,
	tau: results.tau,
	tauOpen: results.tauOpen,
	identification: {
		gain: results.identifikace.gain,
		Tu: results.identifikace.Tu,
		Tn: results.identifikace.Tn,
		slope: results.identifikace.slope
	},
	zieglerNichols: results.zn,
	band: results.band,
	base: metricsOf(results.zakladni),
	frost: metricsOf(results.mrazivy),
	hysteresis: results.hystereze,
	eulerStep: results.krok
};

const target = join(import.meta.dirname, '..', 'test', 'golden.json');
writeFileSync(target, `${JSON.stringify(golden, null, '\t')}\n`);
console.log(`Golden values written to ${target}`);
