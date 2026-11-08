<script lang="ts">
	import {
		MINUTES_PER_DAY,
		localMinuteOfDay,
		nextScheduleChange,
		segmentIndexAt,
		warmestTarget,
		type DailySchedule
	} from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatDecimal, formatTemperature, formatTime } from '#lib/format/format.ts';
	import Card from '#lib/ui/Card.svelte';

	let { schedule }: { schedule: DailySchedule } = $props();

	const home = getHome();
	const AXIS = ['00', '06', '12', '18', '24'];
	const MIN_LABELLED_SHARE = 9;

	const currentIndex = $derived(segmentIndexAt(schedule, localMinuteOfDay(home.now)));
	const warmest = $derived(warmestTarget(schedule));
	const next = $derived(nextScheduleChange(schedule, home.now));
	const nowShare = $derived((localMinuteOfDay(home.now) / MINUTES_PER_DAY) * 100);

	const share = (from: number, to: number) => ((to - from) / MINUTES_PER_DAY) * 100;
	const clock = (minute: number) =>
		`${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
</script>

<Card title="Rozvrh na dnes">
	{#snippet aside()}
		{#if next}
			<span class="text-caption text-text-secondary">
				Další změna {formatTime(next.at)} → {formatTemperature(next.target)}
			</span>
		{/if}
	{/snippet}

	<div aria-hidden="true">
		<div class="relative flex h-10 gap-0.5">
			{#each schedule as segment (segment.from)}
				{@const width = share(segment.from, segment.to)}
				<span
					class={[
						'flex items-center justify-center overflow-hidden rounded-sm text-micro',
						segment.target >= warmest
							? 'bg-accent-muted text-accent'
							: 'bg-surface-sunken text-text-secondary'
					]}
					style:width={`calc(${width}% - 2px)`}
				>
					{width > MIN_LABELLED_SHARE ? formatDecimal(segment.target) : ''}
				</span>
			{/each}
			<span class="absolute -inset-y-1 w-0.5 bg-text-primary" style:left={`${nowShare}%`}></span>
		</div>
		<div class="mt-1.5 flex justify-between text-axis text-text-tertiary">
			{#each AXIS as tick (tick)}<span>{tick}</span>{/each}
		</div>
	</div>

	<ul class="mt-3 divide-y divide-border-subtle border-t border-border-subtle">
		{#each schedule as segment, index (segment.from)}
			{@const current = index === currentIndex}
			<li
				class={[
					'flex min-h-10 items-center justify-between gap-3 text-label tabular-nums',
					current ? 'text-text-primary' : 'font-normal text-text-secondary'
				]}
			>
				<span>{clock(segment.from)}–{clock(segment.to)}</span>
				<span class="flex items-center gap-2">
					{#if current}
						<span class="rounded-xs bg-accent px-1.5 py-0.5 text-micro text-on-accent">Nyní</span>
					{/if}
					{formatTemperature(segment.target)}
				</span>
			</li>
		{/each}
	</ul>
</Card>
