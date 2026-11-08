<script lang="ts">
	import type { Room } from '@doma/core';
	import { resolve } from '$app/paths';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatPercent, formatTemperature } from '#lib/format/format.ts';
	import { describeTileNote } from '#lib/presentation/alerts.ts';
	import { ROOM_STATUS } from '#lib/presentation/status.ts';
	import { TONE_SURFACE } from '#lib/presentation/tone.ts';
	import Measured from '#lib/ui/Measured.svelte';
	import StatusChip from '#lib/ui/StatusChip.svelte';

	let { room }: { room: Room } = $props();

	const home = getHome();
	const target = $derived(home.target(room));
	const status = $derived(home.status(room));
	const alert = $derived(home.alertFor(room));
	const measured = $derived(room.latest?.temperature ?? null);
	const label = $derived(
		`${room.name}, naměřeno ${measured === null ? 'nedostupné' : formatTemperature(measured)}, cíl ${formatTemperature(target.target)}, ${ROOM_STATUS[status].label}`
	);
</script>

<a
	href={resolve('/mistnosti/[id]', { id: room.id })}
	aria-label={label}
	class="flex min-h-[156px] flex-col gap-3 rounded-xl bg-surface p-3.5 transition-colors duration-150 ease-out hover:bg-surface-hover md:min-h-[178px] md:p-[18px]"
>
	<span class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<span class="text-heading">{room.name}</span>
		<StatusChip {status} />
	</span>
	<Measured
		value={measured}
		muted={status === 'stale' || status === 'offline'}
		class="text-value-l-compact md:text-value-l"
	/>
	{#if alert}
		<span
			class={[
				'rounded-sm px-2.5 py-[7px] text-caption font-medium',
				TONE_SURFACE[alert.kind === 'offline' ? 'danger' : 'warning']
			]}
		>
			{describeTileNote(alert, home.now)}
		</span>
	{/if}
	<span class="mt-auto flex items-center justify-between text-caption text-text-secondary">
		<span>
			Cíl <strong class="font-semibold text-text-primary">{formatTemperature(target.target)}</strong
			>{target.source === 'manual' ? ' · ručně' : ''}
		</span>
		{#if room.latest?.humidity != null}
			<span>{formatPercent(room.latest.humidity)}</span>
		{/if}
	</span>
</a>
