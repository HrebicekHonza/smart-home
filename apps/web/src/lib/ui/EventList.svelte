<script lang="ts" module>
	import type { EventPresentation } from '#lib/presentation/events.ts';

	export interface EventRow extends EventPresentation {
		readonly id: string;
		readonly time: string;
	}
</script>

<script lang="ts">
	import { TONE_TEXT } from '#lib/presentation/tone.ts';

	let { events, wideTime = false }: { events: readonly EventRow[]; wideTime?: boolean } = $props();
</script>

<ol class="divide-y divide-border-subtle">
	{#each events as event (event.id)}
		<li
			class={[
				'grid items-start gap-x-2.5 py-2.5 first:pt-0 last:pb-0',
				wideTime ? 'grid-cols-[64px_26px_1fr]' : 'grid-cols-[46px_26px_1fr]'
			]}
		>
			<time class="pt-[3px] text-caption font-medium text-text-secondary tabular-nums">
				{event.time}
			</time>
			<span class="flex size-[26px] items-center justify-center rounded-[8px] bg-surface-raised">
				<event.icon aria-hidden="true" class={['size-3.5', TONE_TEXT[event.tone]]} />
			</span>
			<span class="min-w-0">
				<span class="block text-label">{event.title}</span>
				<span class="block text-micro font-normal text-text-secondary">{event.detail}</span>
			</span>
		</li>
	{/each}
</ol>
