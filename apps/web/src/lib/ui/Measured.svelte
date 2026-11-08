<script lang="ts">
	import type { Celsius } from '@doma/core';
	import { formatDecimal } from '#lib/format/format.ts';

	let {
		value,
		muted = false,
		unit = '°C',
		class: className = ''
	}: { value: Celsius | null; muted?: boolean; unit?: string; class?: string } = $props();
</script>

<span class={['tabular-nums', muted ? 'text-text-tertiary' : 'text-text-primary', className]}>
	{#if value === null}
		—
	{:else}
		{formatDecimal(value)}<span class="unit">{unit}</span>
	{/if}
</span>
