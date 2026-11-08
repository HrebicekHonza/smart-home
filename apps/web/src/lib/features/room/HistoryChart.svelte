<script lang="ts">
	import type { HistoryPoint, HistoryRange } from '@doma/core';
	import { formatTime } from '#lib/format/format.ts';
	import { lastMeasurementBeforeGap } from './chart-geometry.ts';
	import TemperatureChart from './TemperatureChart.svelte';

	let {
		points,
		range,
		chartClass
	}: { points: readonly HistoryPoint[]; range: HistoryRange; chartClass: string } = $props();

	const gap = $derived(lastMeasurementBeforeGap(points));
</script>

<p class="mb-2 flex gap-4 text-micro font-normal text-text-secondary" aria-hidden="true">
	<span class="flex items-center gap-1.5">
		<span class="h-0.5 w-4 rounded-full bg-accent"></span>Naměřená
	</span>
	<span class="flex items-center gap-1.5">
		<span class="w-4 border-t-[1.5px] border-dashed border-text-secondary"></span>Požadovaná
	</span>
</p>
<TemperatureChart {points} {range} class={chartClass} />
{#if gap}
	<p class="mt-3 text-caption text-warning-text">
		Od {formatTime(gap.at)} chybí měření, hlavice neodpovídá.
	</p>
{/if}
