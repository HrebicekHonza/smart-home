<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import type { Snippet } from 'svelte';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatTime } from '#lib/format/format.ts';
	import { navigationItems, type NavigationItem } from '#lib/navigation.ts';
	import ConnectionBanner from '#lib/ui/ConnectionBanner.svelte';
	import DemoBadge from '#lib/ui/DemoBadge.svelte';
	import Toast from '#lib/ui/Toast.svelte';

	let { defaultRoomId, children }: { defaultRoomId: string; children: Snippet } = $props();

	const home = getHome();
	const showDemoBadge = $derived(home.isDemo && page.route.id !== '/simulator');

	const connection = $derived(
		home.loading
			? { label: 'Načítám', dot: 'bg-text-secondary', text: 'text-text-secondary' }
			: home.online
				? { label: 'Online', dot: 'bg-success', text: 'text-success' }
				: { label: 'Bez spojení', dot: 'bg-danger', text: 'text-danger' }
	);

	const hrefs = $derived<Record<NavigationItem['route'], ResolvedPathname>>({
		'/': resolve('/'),
		'/mistnosti/[id]': resolve('/mistnosti/[id]', { id: home.lastRoomId ?? defaultRoomId }),
		'/vytapeni': resolve('/vytapeni'),
		'/simulator': resolve('/simulator')
	});
</script>

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-accent px-4 py-3 text-label text-on-accent focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-text-primary"
>
	Přeskočit na obsah
</a>

<div class="min-h-dvh md:grid md:grid-cols-[96px_minmax(0,1fr)]">
	<nav
		aria-label="Hlavní navigace"
		class="fixed inset-x-0 bottom-0 z-40 border-t border-surface bg-background px-2.5 pt-2 pb-[18px] md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:items-center md:gap-2 md:border-t-0 md:border-r md:px-0 md:py-5"
	>
		<span
			class="mb-4 hidden size-10 items-center justify-center rounded-md bg-accent text-on-accent md:flex"
		>
			<House aria-hidden="true" class="size-5" />
			<span class="sr-only">Doma</span>
		</span>
		<ul class="grid grid-cols-4 gap-1 md:flex md:flex-col md:gap-2">
			{#each navigationItems as item (item.route)}
				{@const current = page.route.id === item.route}
				<li>
					<a
						href={hrefs[item.route]}
						aria-current={current ? 'page' : undefined}
						class={[
							'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-micro transition-colors duration-150 ease-out md:h-16 md:w-[76px]',
							current
								? 'bg-accent-muted text-accent'
								: 'text-text-secondary hover:bg-surface hover:text-text-primary'
						]}
					>
						<item.icon aria-hidden="true" class="size-[22px]" strokeWidth={1.9} />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
		<div class="mt-auto hidden flex-col items-center gap-3 md:flex">
			{#if showDemoBadge}
				<DemoBadge />
			{/if}
			<p class="flex flex-col items-center gap-1">
				<time class="text-[18px] leading-none font-medium tabular-nums">
					{formatTime(home.now)}
				</time>
				<span class={['flex items-center gap-1.5 text-micro', connection.text]}>
					<span aria-hidden="true" class={['size-[7px] rounded-full', connection.dot]}></span>
					{connection.label}
				</span>
			</p>
		</div>
	</nav>

	<main
		id="main"
		tabindex="-1"
		class="px-4 pt-5 pb-28 md:px-8 md:pt-7 md:pb-10"
		aria-busy={home.loading}
	>
		<div class="mx-auto max-w-[1360px]">
			{#if showDemoBadge}
				<div class="mb-4 md:hidden"><DemoBadge /></div>
			{/if}
			{#if home.snapshot?.connection.status === 'offline'}
				<ConnectionBanner lastSyncAt={home.snapshot.connection.lastSyncAt} />
			{/if}
			{@render children()}
		</div>
	</main>
</div>

{#if home.toast}
	{#key home.toast.id}
		<Toast message={home.toast.message} />
	{/key}
{/if}
