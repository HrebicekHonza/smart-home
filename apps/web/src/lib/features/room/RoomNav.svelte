<script lang="ts">
	import type { RoomId } from '@doma/core';
	import { resolve } from '$app/paths';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatTemperature } from '#lib/format/format.ts';
	import { NEEDS_ATTENTION, ROOM_STATUS } from '#lib/presentation/status.ts';
	import { TONE_TEXT } from '#lib/presentation/tone.ts';

	let { currentId }: { currentId: RoomId } = $props();

	const home = getHome();
</script>

<nav aria-label="Místnosti" class="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
	<ul class="flex gap-2 pb-1">
		{#each home.rooms as room (room.id)}
			{@const status = home.status(room)}
			{@const current = room.id === currentId}
			<li class="flex-none">
				<a
					href={resolve('/mistnosti/[id]', { id: room.id })}
					aria-current={current ? 'page' : undefined}
					class={[
						'flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-label whitespace-nowrap transition-colors duration-150 ease-out',
						current
							? 'border-accent-muted-border bg-accent-muted text-accent'
							: 'border-surface bg-surface hover:bg-surface-hover'
					]}
				>
					{room.name}
					<span
						class={['font-normal tabular-nums', current ? 'text-accent' : 'text-text-secondary']}
					>
						{room.latest?.temperature != null ? formatTemperature(room.latest.temperature) : '—'}
					</span>
					{#if NEEDS_ATTENTION.has(status)}
						<span
							role="img"
							aria-label={ROOM_STATUS[status].label}
							class={['size-2 rotate-45 bg-current', TONE_TEXT[ROOM_STATUS[status].tone]]}
						></span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>
