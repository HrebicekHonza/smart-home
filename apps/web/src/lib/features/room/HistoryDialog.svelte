<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { eventRoomId, type HistoryRange, type Room } from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatDayTime, formatTemperature } from '#lib/format/format.ts';
	import { describeEvent } from '#lib/presentation/events.ts';
	import EventList from '#lib/ui/EventList.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';
	import { measuredSummary } from './chart-geometry.ts';
	import EmptyHistory from './EmptyHistory.svelte';
	import HistoryChart from './HistoryChart.svelte';

	let {
		room,
		range,
		onrange,
		onclose
	}: {
		room: Room;
		range: HistoryRange | null;
		onrange: (range: HistoryRange) => void;
		onclose: () => void;
	} = $props();

	const home = getHome();
	const titleId = $props.id();
	const RANGES: readonly { value: HistoryRange; label: string }[] = [
		{ value: '24h', label: '24 hodin' },
		{ value: '7d', label: '7 dní' }
	];

	let dialog: HTMLDialogElement | undefined = $state();
	let closeButton: HTMLButtonElement | undefined = $state();

	const history = $derived(range ? home.history(room.id, range) : null);
	const events = $derived(
		(home.snapshot?.events ?? [])
			.filter((event) => eventRoomId(event) === room.id)
			.slice(0, 6)
			.map((event) => ({
				id: event.id,
				time: formatDayTime(event.at, home.now),
				...describeEvent(event, home.rooms)
			}))
	);

	$effect(() => {
		if (!dialog) return;
		if (range && !dialog.open) {
			dialog.showModal();
			closeButton?.focus();
		} else if (!range && dialog.open) {
			dialog.close();
		}
	});

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === dialog) onclose();
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={closeOnBackdrop}
	class="mx-0 mt-10 mb-0 h-[calc(100dvh-40px)] max-h-none w-full max-w-none rounded-t-2xl bg-surface p-0 text-text-primary backdrop:bg-scrim md:m-auto md:h-auto md:max-h-[calc(100dvh-64px)] md:w-[calc(100%-64px)] md:max-w-[820px] md:rounded-2xl"
>
	{#if range}
		<div class="flex flex-col gap-5 p-5 md:p-6">
			<header class="flex items-start justify-between gap-3">
				<div>
					<h2 id={titleId} class="text-title-compact">Historie · {room.name}</h2>
					{#if home.isDemo}
						<p class="mt-1 text-caption text-text-secondary">Demo data, ukázkový průběh</p>
					{/if}
				</div>
				<button
					bind:this={closeButton}
					type="button"
					aria-label="Zavřít historii"
					onclick={onclose}
					class="flex size-11 flex-none items-center justify-center rounded-md bg-surface-raised hover:bg-surface-raised-hover"
				>
					<X aria-hidden="true" class="size-5" />
				</button>
			</header>

			<div
				role="group"
				aria-label="Období"
				class="flex w-fit gap-1 rounded-md bg-surface-sunken p-1"
			>
				{#each RANGES as option (option.value)}
					<button
						type="button"
						aria-pressed={range === option.value}
						onclick={() => onrange(option.value)}
						class={[
							'min-h-10 rounded-[9px] px-3.5 text-label',
							range === option.value
								? 'bg-surface-raised text-text-primary'
								: 'text-text-secondary hover:text-text-primary'
						]}
					>
						{option.label}
					</button>
				{/each}
			</div>

			{#await history}
				<Skeleton class="h-[180px] md:h-[240px]" />
			{:then points}
				{#if points && points.length > 0}
					{@const summary = measuredSummary(points)}
					<div>
						<HistoryChart {points} {range} chartClass="h-[180px] md:h-[240px]" />
					</div>
					{#if summary}
						<dl class="grid grid-cols-3 gap-2">
							{#each [{ label: 'Nejnižší', value: summary.min }, { label: 'Nejvyšší', value: summary.max }, { label: 'Průměr naměřené', value: summary.average }] as stat (stat.label)}
								<div class="rounded-md bg-surface-sunken p-3">
									<dt class="text-micro font-normal text-text-secondary">{stat.label}</dt>
									<dd class="text-label tabular-nums">{formatTemperature(stat.value)}</dd>
								</div>
							{/each}
						</dl>
					{/if}
				{:else}
					<EmptyHistory />
				{/if}
			{/await}

			<section aria-labelledby={`${titleId}-events`}>
				<h3 id={`${titleId}-events`} class="mb-3 text-heading">Události v místnosti</h3>
				{#if events.length > 0}
					<EventList {events} wideTime />
				{:else}
					<p class="text-caption text-text-secondary">Zatím žádné události v místnosti.</p>
				{/if}
			</section>
		</div>
	{/if}
</dialog>
