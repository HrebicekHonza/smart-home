<script lang="ts">
	import { getHome } from '#lib/app/home-context.ts';
	import AlertList from '#lib/features/overview/AlertList.svelte';
	import BoilerCard from '#lib/features/overview/BoilerCard.svelte';
	import ModeControl from '#lib/features/overview/ModeControl.svelte';
	import OverviewSkeleton from '#lib/features/overview/OverviewSkeleton.svelte';
	import QuickControls from '#lib/features/overview/QuickControls.svelte';
	import RecentEvents from '#lib/features/overview/RecentEvents.svelte';
	import RoomRow from '#lib/features/overview/RoomRow.svelte';
	import RoomTile from '#lib/features/overview/RoomTile.svelte';
	import { formatDay, formatTime } from '#lib/format/format.ts';

	const home = getHome();
	const favorites = $derived(home.rooms.filter((room) => room.favorite));
	const others = $derived(home.rooms.filter((room) => !room.favorite));
</script>

<svelte:head>
	<title>Přehled · Doma</title>
</svelte:head>

<header class="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
	<div>
		<h1 class="text-title-compact md:text-title">Přehled</h1>
		{#if !home.loading}
			<p class="mt-1 text-label font-normal text-text-secondary">
				{formatDay(home.now)} · {formatTime(home.now)}
			</p>
		{/if}
	</div>
	<ModeControl />
</header>

<div
	class="grid grid-cols-1 gap-6 min-[1440px]:grid-cols-[minmax(0,1fr)_380px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5"
>
	<div class="flex flex-col gap-6">
		{#if home.loading}
			<OverviewSkeleton />
		{:else}
			<AlertList />
			<section aria-labelledby="favorite-rooms">
				<h2 id="favorite-rooms" class="mb-3 text-heading">Oblíbené místnosti</h2>
				<ul class="grid grid-cols-2 gap-3 min-[1440px]:grid-cols-4">
					{#each favorites as room (room.id)}
						<li class="grid"><RoomTile {room} /></li>
					{/each}
				</ul>
			</section>
			<section aria-labelledby="other-rooms">
				<h2 id="other-rooms" class="mb-3 text-heading">Ostatní místnosti</h2>
				<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each others as room (room.id)}
						<li class="grid"><RoomRow {room} /></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>

	{#if !home.loading}
		<div class="flex flex-col gap-4">
			<QuickControls />
			<BoilerCard />
			<RecentEvents limit={6} />
		</div>
	{/if}
</div>
