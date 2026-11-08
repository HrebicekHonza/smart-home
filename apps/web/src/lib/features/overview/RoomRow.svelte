<script lang="ts">
	import type { Room } from '@doma/core';
	import { resolve } from '$app/paths';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatTemperature } from '#lib/format/format.ts';
	import { ROOM_STATUS } from '#lib/presentation/status.ts';
	import Measured from '#lib/ui/Measured.svelte';
	import StatusChip from '#lib/ui/StatusChip.svelte';

	let { room }: { room: Room } = $props();

	const home = getHome();
	const target = $derived(home.target(room));
	const status = $derived(home.status(room));
	const measured = $derived(room.latest?.temperature ?? null);
</script>

<a
	href={resolve('/mistnosti/[id]', { id: room.id })}
	aria-label={`${room.name}, naměřeno ${measured === null ? 'nedostupné' : formatTemperature(measured)}, cíl ${formatTemperature(target.target)}, ${ROOM_STATUS[status].label}`}
	class="grid min-h-[60px] grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-surface px-3.5 py-2.5 transition-colors duration-150 ease-out hover:bg-surface-hover"
>
	<span class="flex flex-col gap-0.5">
		<span class="text-body font-semibold">{room.name}</span>
		<StatusChip {status} size="micro" />
	</span>
	<span class="flex flex-col items-end gap-0.5">
		<Measured
			value={measured}
			muted={status === 'stale' || status === 'offline'}
			class="text-value-s"
		/>
		<span class="text-micro font-normal text-text-secondary">
			Cíl {formatTemperature(target.target)}
		</span>
	</span>
</a>
