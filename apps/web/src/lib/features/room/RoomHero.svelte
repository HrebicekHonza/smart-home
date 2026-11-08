<script lang="ts">
	import type { Room } from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import {
		formatDuration,
		formatPercent,
		formatTemperature,
		formatTime,
		minutesBetween
	} from '#lib/format/format.ts';
	import Measured from '#lib/ui/Measured.svelte';
	import StatusChip from '#lib/ui/StatusChip.svelte';

	let { room }: { room: Room } = $props();

	const home = getHome();
	const status = $derived(home.status(room));
	const target = $derived(home.target(room));
	const alert = $derived(home.alertFor(room));
	const measured = $derived(room.latest?.temperature ?? null);
	const muted = $derived(status === 'stale' || status === 'offline');
	const humidity = $derived(
		room.latest?.humidity != null ? formatPercent(room.latest.humidity) : '—'
	);
	const windowText = $derived(
		{ open: 'Otevřené', closed: 'Zavřené', unknown: 'Bez senzoru' }[room.window.state]
	);
	const age = $derived.by(() => {
		if (alert?.kind === 'offline' && alert.since) return `Bez měření od ${formatTime(alert.since)}`;
		if (!room.latest) return 'Bez měření';
		return `Naměřeno před ${formatDuration(minutesBetween(room.latest.at, home.now))}`;
	});
</script>

{#if room.photoUrl}
	<section
		aria-label="Naměřená teplota"
		class="relative flex h-[260px] flex-col justify-between overflow-hidden rounded-xl p-4 md:h-[300px]"
	>
		<img src={room.photoUrl} alt="" class="absolute inset-0 size-full object-cover" />
		<p class="relative flex gap-2">
			<span class="rounded-md bg-glass px-2.5 py-1.5 text-micro backdrop-blur-[12px]">
				Vlhkost {humidity}
			</span>
			<span class="rounded-md bg-glass px-2.5 py-1.5 text-micro backdrop-blur-[12px]">
				Okno {windowText.toLocaleLowerCase('cs-CZ')}
			</span>
		</p>
		<div class="relative w-fit min-w-60 rounded-lg bg-glass px-[18px] py-4 backdrop-blur-[12px]">
			{@render reading()}
		</div>
	</section>
{:else}
	<section aria-label="Naměřená teplota" class="rounded-xl bg-surface p-5">
		{@render reading()}
		<dl class="mt-5 grid grid-cols-3 gap-2">
			<div class="rounded-md bg-surface-sunken p-3">
				<dt class="text-micro font-normal text-text-secondary">Cíl</dt>
				<dd class="text-label">{formatTemperature(target.target)}</dd>
			</div>
			<div class="rounded-md bg-surface-sunken p-3">
				<dt class="text-micro font-normal text-text-secondary">Vlhkost</dt>
				<dd class="text-label">{humidity}</dd>
			</div>
			<div class="rounded-md bg-surface-sunken p-3">
				<dt class="text-micro font-normal text-text-secondary">Okno</dt>
				<dd class="text-label">{windowText}</dd>
			</div>
		</dl>
	</section>
{/if}

{#snippet reading()}
	<p class="flex items-center justify-between gap-3 text-label font-normal text-text-secondary">
		Naměřená teplota
		<StatusChip {status} />
	</p>
	<Measured value={measured} {muted} class="mt-2 block text-value-xl-compact md:text-value-xl" />
	<p class="mt-2 text-caption text-text-secondary">
		{#if room.photoUrl}
			Cíl <strong class="text-text-primary">{formatTemperature(target.target)}</strong> ·
		{/if}
		{age}
	</p>
{/snippet}
