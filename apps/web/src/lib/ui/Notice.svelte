<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { AlertPresentation } from '#lib/presentation/alerts.ts';
	import { TONE_SURFACE, TONE_SURFACE_TEXT, TONE_TEXT } from '#lib/presentation/tone.ts';

	let { alert, href }: { alert: AlertPresentation; href?: string } = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	role={href ? undefined : 'note'}
	class={[
		'flex min-h-14 items-center gap-3 rounded-lg px-3.5 py-3',
		TONE_SURFACE[alert.tone],
		href && 'transition-[filter] duration-150 ease-out hover:brightness-110'
	]}
>
	<alert.icon aria-hidden="true" class={['size-5 flex-none', TONE_TEXT[alert.tone]]} />
	<span class="min-w-0 flex-1">
		<span class="block text-label font-semibold text-text-primary">{alert.title}</span>
		<span class={['block text-caption', TONE_SURFACE_TEXT[alert.tone]]}>{alert.text}</span>
	</span>
	{#if href}
		<ChevronRight aria-hidden="true" class="size-[18px] flex-none text-text-primary" />
	{/if}
</svelte:element>
