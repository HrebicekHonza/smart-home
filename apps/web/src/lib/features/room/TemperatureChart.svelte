<script lang="ts">
	import type { HistoryPoint, HistoryRange } from '@doma/core';
	import { formatDecimal, formatTime } from '#lib/format/format.ts';
	import { chartGeometry } from './chart-geometry.ts';

	let {
		points,
		range,
		class: className = ''
	}: { points: readonly HistoryPoint[]; range: HistoryRange; class?: string } = $props();

	const WIDTH = 600;
	const HEIGHT = 100;
	const WEEKDAYS = new Intl.DateTimeFormat('cs-CZ', { weekday: 'short' });

	const geometry = $derived(chartGeometry(points, WIDTH, HEIGHT));
	const xTicks = $derived.by(() => {
		const first = points[0]?.at;
		const last = points.at(-1)?.at;
		if (first === undefined || last === undefined) return [];
		const count = range === '24h' ? 5 : 7;
		return Array.from({ length: count }, (_, index) => {
			const at = first + ((last - first) * index) / (count - 1);
			if (range === '7d') return WEEKDAYS.format(at);
			return index === count - 1 ? 'Teď' : formatTime(at);
		});
	});
	const description = $derived(
		`Graf naměřené a požadované teploty, ${range === '24h' ? 'posledních 24 hodin' : 'posledních 7 dní'}`
	);
</script>

<figure class={['grid grid-cols-[auto_1fr] grid-rows-[minmax(0,1fr)_auto] gap-x-2', className]}>
	<div
		class="flex flex-col justify-between text-axis text-text-tertiary tabular-nums"
		aria-hidden="true"
	>
		{#each geometry.yTicks as tick (tick)}<span>{formatDecimal(tick)}</span>{/each}
	</div>
	<svg
		viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
		preserveAspectRatio="none"
		role="img"
		aria-label={description}
		class="h-full w-full overflow-visible"
	>
		{#each geometry.gridLines as y (y)}
			<line
				x1="0"
				x2={WIDTH}
				y1={y}
				y2={y}
				class="stroke-border-subtle"
				vector-effect="non-scaling-stroke"
			/>
		{/each}
		<polyline
			points={geometry.target}
			fill="none"
			stroke-dasharray="4 4"
			stroke-width="1.5"
			class="stroke-text-secondary"
			vector-effect="non-scaling-stroke"
		/>
		{#each geometry.measured as line, index (index)}
			<polyline
				points={line}
				fill="none"
				stroke-width="2.25"
				stroke-linejoin="round"
				class="stroke-accent"
				vector-effect="non-scaling-stroke"
			/>
		{/each}
	</svg>
	<div
		class="col-start-2 mt-1.5 flex justify-between text-axis text-text-tertiary"
		aria-hidden="true"
	>
		{#each xTicks as tick, index (index)}<span>{tick}</span>{/each}
	</div>
</figure>
