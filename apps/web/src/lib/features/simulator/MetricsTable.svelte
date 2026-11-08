<script lang="ts">
	import type { Metrics } from '@doma/simulation';
	import { formatDuration, formatNumber } from '#lib/format/format.ts';
	import { CONTROLLERS } from './controllers.ts';
	import type { SimulationRun } from './simulator-state.svelte.ts';

	let { runs, band }: { runs: readonly SimulationRun[]; band: number } = $props();

	const NBSP = String.fromCharCode(0xa0);

	const COLUMNS: readonly {
		key: keyof Metrics;
		label: string;
		format: (metrics: Metrics) => string;
	}[] = [
		{
			key: 'energyKWh',
			label: 'Energie',
			format: (m) => `${formatNumber(m.energyKWh, 2, 2)}${NBSP}kWh`
		},
		{
			key: 'minutesOutsideBand',
			label: 'Mimo pásmo',
			format: (m) => `${formatNumber(m.minutesOutsideBand, 1, 1)}${NBSP}min`
		},
		{
			key: 'minutesBelowBand',
			label: 'Pod pásmem',
			format: (m) => `${formatNumber(m.minutesBelowBand, 1, 1)}${NBSP}min`
		},
		{
			key: 'overshoot',
			label: 'Překmit',
			format: (m) => `${formatNumber(m.overshoot, 2, 2)}${NBSP}K`
		},
		{
			key: 'settlingTime',
			label: 'Doba regulace',
			format: (m) =>
				m.settlingTime === null ? 'neustálí se' : formatDuration(Math.round(m.settlingTime / 60))
		},
		{ key: 'switches', label: 'Sepnutí', format: (m) => formatNumber(m.switches, 0) },
		{
			key: 'meanAbsError',
			label: 'Průměrná odchylka',
			format: (m) => `${formatNumber(m.meanAbsError, 2, 2)}${NBSP}K`
		}
	];
</script>

<section aria-labelledby="simulation-metrics" class="rounded-xl bg-surface p-4">
	<h2 id="simulation-metrics" class="text-heading">Ukazatele</h2>
	<p class="mt-1 text-caption text-text-secondary">
		Výsledek modelu, ne předpověď pro skutečný dům. Pásmo komfortu ±{formatNumber(band, 1)}&nbsp;K,
		doba regulace do první změny žádané teploty.
	</p>
	<div class="mt-3 overflow-x-auto">
		<table class="w-full min-w-[720px] text-caption tabular-nums">
			<thead>
				<tr class="border-b border-border-subtle text-left text-micro text-text-secondary">
					<th scope="col" class="py-2 pr-3 font-medium">Regulátor</th>
					{#each COLUMNS as column (column.key)}
						<th scope="col" class="px-2 py-2 text-right font-medium">{column.label}</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-border-subtle">
				{#each runs as run (run.kind)}
					<tr>
						<th scope="row" class="py-2.5 pr-3 text-left font-medium">
							<span class="flex items-center gap-2">
								<span class={['h-0.5 w-4 flex-none rounded-full', CONTROLLERS[run.kind].swatch]}
								></span>
								{CONTROLLERS[run.kind].label}
							</span>
						</th>
						{#each COLUMNS as column (column.key)}
							<td class="px-2 py-2.5 text-right font-mono">{column.format(run.metrics)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
