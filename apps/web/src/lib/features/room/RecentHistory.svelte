<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Room } from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import Card from '#lib/ui/Card.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';
	import EmptyHistory from './EmptyHistory.svelte';
	import HistoryChart from './HistoryChart.svelte';

	let { room, onopen }: { room: Room; onopen: () => void } = $props();

	const home = getHome();
	const history = $derived(home.history(room.id, '24h'));
</script>

<Card title="Posledních 24 h">
	{#snippet aside()}
		<button
			type="button"
			onclick={onopen}
			class="flex min-h-11 items-center gap-1 rounded-md px-2 text-label text-accent hover:bg-accent-muted"
		>
			Otevřít historii <ChevronRight aria-hidden="true" class="size-4" />
		</button>
	{/snippet}
	{#await history}
		<Skeleton class="h-[120px]" />
	{:then points}
		{#if points.length > 0}
			<HistoryChart {points} range="24h" chartClass="h-[120px]" />
		{:else}
			<EmptyHistory />
		{/if}
	{/await}
</Card>
