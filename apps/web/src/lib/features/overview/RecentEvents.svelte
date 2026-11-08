<script lang="ts">
	import { getHome } from '#lib/app/home-context.ts';
	import { formatDayTime } from '#lib/format/format.ts';
	import { describeEvent } from '#lib/presentation/events.ts';
	import Card from '#lib/ui/Card.svelte';
	import EventList from '#lib/ui/EventList.svelte';

	let { limit }: { limit: number } = $props();

	const home = getHome();
	const events = $derived(
		(home.snapshot?.events ?? []).slice(0, limit).map((event) => ({
			id: event.id,
			time: formatDayTime(event.at, home.now),
			...describeEvent(event, home.rooms)
		}))
	);
</script>

<Card title="Poslední události">
	{#if events.length > 0}
		<EventList {events} wideTime={events.some((event) => event.time.includes(' '))} />
	{:else}
		<p class="text-caption text-text-secondary">Zatím žádné události.</p>
	{/if}
</Card>
