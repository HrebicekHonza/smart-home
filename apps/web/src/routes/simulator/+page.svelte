<script lang="ts">
	import { CONTROLLERS } from '#lib/features/simulator/controllers.ts';
	import MetricsTable from '#lib/features/simulator/MetricsTable.svelte';
	import ParameterPanel from '#lib/features/simulator/ParameterPanel.svelte';
	import SimulatorAbout from '#lib/features/simulator/SimulatorAbout.svelte';
	import { simulatorOnly } from '#lib/app/edition.ts';
	import type { ChartSeries } from '#lib/features/simulator/chart-series.ts';
	import SimulationChart from '#lib/features/simulator/SimulationChart.svelte';
	import { SimulatorState } from '#lib/features/simulator/simulator-state.svelte.ts';

	const simulator = new SimulatorState();
	const onhover = (index: number | null) => (simulator.hoverIndex = index);

	const reference = $derived(simulator.runs[0]?.result);
	const times = $derived(reference?.t ?? []);

	const temperatureSeries = $derived<ChartSeries[]>([
		...simulator.runs.map((run) => ({
			id: run.kind,
			label: CONTROLLERS[run.kind].label,
			values: run.result.y,
			stroke: CONTROLLERS[run.kind].stroke,
			swatch: CONTROLLERS[run.kind].swatch
		})),
		...(reference
			? [
					{
						id: 'setpoint',
						label: 'Žádaná teplota',
						values: reference.w,
						stroke: 'stroke-text-secondary',
						swatch: 'bg-text-secondary',
						dashed: true
					}
				]
			: [])
	]);

	const powerSeries = $derived<ChartSeries[]>(
		simulator.runs.map((run) => ({
			id: run.kind,
			label: CONTROLLERS[run.kind].label,
			values: run.result.heat,
			stroke: CONTROLLERS[run.kind].stroke,
			swatch: CONTROLLERS[run.kind].swatch
		}))
	);

	const outdoorSeries = $derived<ChartSeries[]>(
		reference
			? [
					{
						id: 'outdoor',
						label: 'Venkovní teplota',
						values: reference.outdoor,
						stroke: 'stroke-text-secondary',
						swatch: 'bg-text-secondary'
					}
				]
			: []
	);
</script>

<svelte:head>
	<title>Simulátor · Doma</title>
</svelte:head>

<header class="mb-5 flex flex-wrap items-end justify-between gap-3">
	<div>
		<h1 class="text-title-compact md:text-title">Simulátor</h1>
		<p class="mt-1 text-label font-normal text-text-secondary">
			Tepelný model místnosti a porovnání regulátorů vytápění
		</p>
	</div>
	<span
		class="rounded-xs border border-accent-muted-border bg-accent-muted px-2 py-1 font-mono text-axis tracking-[0.06em] text-accent"
	>
		VÝSTUP SIMULACE
	</span>
</header>

<SimulatorAbout open={simulatorOnly} />

<div class="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
	<ParameterPanel {simulator} />

	<div class="flex min-w-0 flex-col gap-4">
		{#if simulator.runs.length > 0}
			<ul class="flex flex-wrap gap-x-5 gap-y-2 text-caption" aria-label="Legenda">
				{#each temperatureSeries as line (line.id)}
					<li class="flex items-center gap-2">
						<span
							class={[
								'w-5 flex-none',
								line.dashed
									? 'border-t-[1.5px] border-dashed border-text-secondary'
									: ['h-0.5 rounded-full', line.swatch]
							]}
						></span>
						{line.label}
					</li>
				{/each}
				{#if simulator.windowIntervals.length > 0}
					<li class="flex items-center gap-2">
						<span class="h-3 w-5 flex-none rounded-xs bg-text-secondary/10"></span>
						Otevřené okno
					</li>
				{/if}
			</ul>

			<SimulationChart
				title="Teplota v místnosti"
				unit="°C"
				{times}
				duration={simulator.duration}
				series={temperatureSeries}
				shaded={simulator.windowIntervals}
				hoverIndex={simulator.hoverIndex}
				{onhover}
				decimals={2}
				heightClass="h-64 md:h-72"
			/>
			<SimulationChart
				title="Výkon dodaný radiátorem"
				unit="W"
				{times}
				duration={simulator.duration}
				series={powerSeries}
				shaded={simulator.windowIntervals}
				hoverIndex={simulator.hoverIndex}
				{onhover}
				decimals={0}
				baseline={0}
				heightClass="h-44 md:h-52"
			/>
			<SimulationChart
				title="Venkovní teplota"
				unit="°C"
				{times}
				duration={simulator.duration}
				series={outdoorSeries}
				shaded={simulator.windowIntervals}
				hoverIndex={simulator.hoverIndex}
				{onhover}
				decimals={1}
				heightClass="h-28"
			/>
			<MetricsTable runs={simulator.runs} band={simulator.band} />
		{:else}
			<div class="rounded-xl border border-dashed border-border bg-surface-sunken p-5">
				<p class="text-label">Není co zobrazit</p>
				<p class="mt-1 text-caption text-text-secondary">
					Vyberte alespoň jeden regulátor a zkontrolujte parametry místnosti.
				</p>
			</div>
		{/if}
	</div>
</div>
