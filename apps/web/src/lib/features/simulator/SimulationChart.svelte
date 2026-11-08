<script lang="ts">
	import { formatNumber } from '#lib/format/format.ts';
	import { niceScale, polylinePoints } from './chart-scale.ts';
	import type { ChartSeries } from './chart-series.ts';

	let {
		title,
		unit,
		times,
		duration,
		series,
		shaded,
		hoverIndex,
		onhover,
		decimals,
		baseline,
		heightClass
	}: {
		title: string;
		unit: string;
		times: readonly number[];
		duration: number;
		series: readonly ChartSeries[];
		shaded: readonly (readonly [number, number])[];
		hoverIndex: number | null;
		onhover: (index: number | null) => void;
		decimals: number;
		baseline?: number;
		heightClass: string;
	} = $props();

	const WIDTH = 1000;
	const HEIGHT = 300;
	const HOUR = 3600;
	const KEY_STEP = 20;
	const X_TICKS = [0, 6, 12, 18, 24];

	const scale = $derived(
		niceScale([
			...series.flatMap((line) => line.values),
			...(baseline === undefined ? [] : [baseline])
		])
	);
	const span = $derived(scale.max - scale.min || 1);
	const hoverTime = $derived(hoverIndex === null ? null : (times[hoverIndex] ?? null));
	const clock = (seconds: number) => {
		const minutes = Math.round(seconds / 60);
		return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
	};
	const percentX = (seconds: number) => `${(seconds / duration) * 100}%`;
	const percentY = (value: number) => `${((scale.max - value) / span) * 100}%`;

	function indexAt(event: PointerEvent): number {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const share = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
		return Math.round(share * (times.length - 1));
	}

	function onkeydown(event: KeyboardEvent) {
		const current = hoverIndex ?? 0;
		if (event.key === 'ArrowRight') onhover(Math.min(times.length - 1, current + KEY_STEP));
		else if (event.key === 'ArrowLeft') onhover(Math.max(0, current - KEY_STEP));
		else if (event.key === 'Escape') onhover(null);
		else return;
		event.preventDefault();
	}
</script>

<figure class="rounded-xl bg-surface p-4">
	<figcaption class="mb-3 flex items-baseline justify-between gap-3">
		<span class="text-heading">{title}</span>
		<span class="font-mono text-axis text-text-tertiary">{unit}</span>
	</figcaption>

	<div class={['grid grid-cols-[auto_1fr] grid-rows-[minmax(0,1fr)_auto] gap-x-2', heightClass]}>
		<div class="relative w-10" aria-hidden="true">
			{#each scale.ticks as tick (tick)}
				<span
					class="absolute right-0 -translate-y-1/2 font-mono text-axis text-text-tertiary tabular-nums"
					style:top={percentY(tick)}
				>
					{formatNumber(tick, 1)}
				</span>
			{/each}
		</div>

		<div
			role="slider"
			tabindex="0"
			aria-label={`${title}, posun v čase šipkami`}
			aria-valuemin={0}
			aria-valuemax={times.length - 1}
			aria-valuenow={hoverIndex ?? 0}
			aria-valuetext={hoverTime === null ? 'Bez výběru' : clock(hoverTime)}
			class="relative touch-none rounded-xs"
			onpointermove={(event) => onhover(indexAt(event))}
			onpointerdown={(event) => onhover(indexAt(event))}
			onpointerleave={() => onhover(null)}
			{onkeydown}
		>
			{#each shaded as [from, to] (from)}
				<span
					class="absolute inset-y-0 bg-text-secondary/10"
					style:left={percentX(from * HOUR)}
					style:width={percentX((to - from) * HOUR)}
				></span>
			{/each}
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				preserveAspectRatio="none"
				class="absolute inset-0 size-full overflow-visible"
				aria-hidden="true"
			>
				{#each scale.ticks as tick (tick)}
					{@const y = ((scale.max - tick) / span) * HEIGHT}
					<line
						x1="0"
						x2={WIDTH}
						y1={y}
						y2={y}
						class="stroke-border-subtle"
						vector-effect="non-scaling-stroke"
					/>
				{/each}
				{#each series as line (line.id)}
					<polyline
						points={polylinePoints(times, line.values, duration, scale, WIDTH, HEIGHT)}
						fill="none"
						stroke-width={line.dashed ? 1.5 : 2}
						stroke-dasharray={line.dashed ? '4 4' : undefined}
						stroke-linejoin="round"
						class={line.stroke}
						vector-effect="non-scaling-stroke"
					/>
				{/each}
			</svg>

			{#if hoverIndex !== null && hoverTime !== null}
				<span
					class="pointer-events-none absolute inset-y-0 w-px bg-text-primary"
					style:left={percentX(hoverTime)}
				></span>
				<div
					class={[
						'pointer-events-none absolute top-2 z-10 min-w-44 rounded-md border border-border bg-surface-raised p-2.5 text-micro shadow-toast',
						hoverTime > duration / 2 ? '-translate-x-[calc(100%+8px)]' : 'translate-x-2'
					]}
					style:left={percentX(hoverTime)}
				>
					<p class="mb-1.5 font-mono text-text-secondary">{clock(hoverTime)}</p>
					<ul class="flex flex-col gap-1">
						{#each series as line (line.id)}
							<li class="flex items-center justify-between gap-3">
								<span class="flex items-center gap-1.5 font-normal text-text-secondary">
									<span class={['h-0.5 w-3 rounded-full', line.swatch]}></span>
									{line.label}
								</span>
								<span class="font-mono tabular-nums">
									{formatNumber(line.values[hoverIndex] ?? Number.NaN, decimals)}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<div
			class="relative col-start-2 mt-1.5 h-4 font-mono text-axis text-text-tertiary"
			aria-hidden="true"
		>
			{#each X_TICKS as hour (hour)}
				<span
					class={[
						'absolute',
						hour === 0 ? '' : hour === 24 ? '-translate-x-full' : '-translate-x-1/2'
					]}
					style:left={percentX(hour * HOUR)}
				>
					{String(hour).padStart(2, '0')}:00
				</span>
			{/each}
		</div>
	</div>
</figure>
