<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import History from '@lucide/svelte/icons/history';
	import type { HistoryRange } from '@doma/core';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { getHome } from '#lib/app/home-context.ts';
	import DeviceList from '#lib/features/room/DeviceList.svelte';
	import HistoryDialog from '#lib/features/room/HistoryDialog.svelte';
	import RecentHistory from '#lib/features/room/RecentHistory.svelte';
	import RoomHero from '#lib/features/room/RoomHero.svelte';
	import RoomNav from '#lib/features/room/RoomNav.svelte';
	import ScheduleDay from '#lib/features/room/ScheduleDay.svelte';
	import TargetControl from '#lib/features/room/TargetControl.svelte';
	import { describeRoomAlert } from '#lib/presentation/alerts.ts';
	import Notice from '#lib/ui/Notice.svelte';
	import Skeleton from '#lib/ui/Skeleton.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const HISTORY_PARAM = 'historie';
	const home = getHome();
	const room = $derived(home.room(data.roomId));
	const alert = $derived(room ? home.alertFor(room) : undefined);
	const historyRange = $derived.by((): HistoryRange | null => {
		if (!browser) return null;
		const value = page.url.searchParams.get(HISTORY_PARAM);
		return value === '24h' || value === '7d' ? value : null;
	});

	$effect(() => {
		home.lastRoomId = data.roomId;
	});

	function historyUrl(range: HistoryRange | null): ResolvedPathname {
		const params = { id: data.roomId };
		return range
			? resolve(`/mistnosti/[id]?${HISTORY_PARAM}=${range}`, params)
			: resolve('/mistnosti/[id]', params);
	}

	function openHistory(range: HistoryRange) {
		void goto(historyUrl(range), { reset: false, state: { historyOpenedInApp: true } });
	}

	function changeRange(range: HistoryRange) {
		void goto(historyUrl(range), { reset: false, replace: true, state: page.state });
	}

	function closeHistory() {
		if (page.state.historyOpenedInApp) {
			history.back();
			return;
		}
		void goto(historyUrl(null), { reset: false, replace: true });
	}
</script>

<svelte:head>
	<title>{room?.name ?? 'Místnost'} · Doma</title>
</svelte:head>

<header class="mb-4 flex items-center gap-3">
	<a
		href={resolve('/')}
		class="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md bg-surface px-2 text-label text-text-secondary hover:bg-surface-hover hover:text-text-primary md:px-3"
	>
		<ChevronLeft aria-hidden="true" class="size-5" />
		<span class="sr-only md:not-sr-only">Přehled</span>
	</a>
	<h1 class="min-w-0 flex-1 truncate text-title-compact md:text-title">{room?.name ?? ''}</h1>
	<button
		type="button"
		disabled={!room}
		onclick={() => openHistory('24h')}
		class="flex min-h-11 items-center gap-2 rounded-md px-3 text-label text-accent hover:bg-accent-muted"
	>
		<History aria-hidden="true" class="size-[18px]" />
		Historie
	</button>
</header>

{#if room}
	<div class="mb-5"><RoomNav currentId={room.id} /></div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-5">
		<div class="flex flex-col gap-4">
			<RoomHero {room} />
			{#if alert}
				<Notice alert={describeRoomAlert(alert, home.now)} />
			{/if}
			<TargetControl {room} />
		</div>
		<div class="flex flex-col gap-4">
			<ScheduleDay schedule={room.schedule} />
			<RecentHistory {room} onopen={() => openHistory('24h')} />
			<DeviceList {room} />
		</div>
	</div>

	<HistoryDialog {room} range={historyRange} onrange={changeRange} onclose={closeHistory} />
{:else}
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5" aria-hidden="true">
		<Skeleton class="h-[300px] rounded-xl" />
		<Skeleton class="h-[300px] rounded-xl" />
	</div>
{/if}
