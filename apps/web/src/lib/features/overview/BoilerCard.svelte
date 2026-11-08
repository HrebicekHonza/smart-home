<script lang="ts">
	import Flame from '@lucide/svelte/icons/flame';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatTime } from '#lib/format/format.ts';
	import Card from '#lib/ui/Card.svelte';
	import Measured from '#lib/ui/Measured.svelte';

	const home = getHome();
	const boiler = $derived(home.snapshot?.boiler);
	const fill = (value: number, max: number) => `${Math.min(100, (value / max) * 100)}%`;
</script>

{#if boiler}
	<Card title="Kotel">
		{#snippet aside()}
			{#if boiler.running}
				<span class="flex items-center gap-1.5 text-label text-accent">
					<Flame aria-hidden="true" class="size-[15px]" />
					Provoz
				</span>
			{/if}
		{/snippet}
		<p class="flex items-baseline justify-between gap-3">
			<Measured value={boiler.waterTemperature} class="text-value-m" />
			<span class="text-caption text-text-secondary">
				voda · nastaveno {boiler.waterSetpoint}&nbsp;°C
			</span>
		</p>
		{#if boiler.waterTemperature !== null}
			<div
				role="meter"
				aria-label="Teplota vody kotle"
				aria-valuemin={0}
				aria-valuemax={boiler.waterMax}
				aria-valuenow={boiler.waterTemperature}
				class="relative mt-3 h-2 rounded-full bg-surface-sunken"
			>
				<span
					class="absolute inset-y-0 left-0 rounded-full bg-accent"
					style:width={fill(boiler.waterTemperature, boiler.waterMax)}
				></span>
				<span
					aria-hidden="true"
					class="absolute -top-1 h-4 w-0.5 bg-text-primary"
					style:left={fill(boiler.waterSetpoint, boiler.waterMax)}
				></span>
			</div>
		{/if}
		<p class="mt-3 text-caption text-text-secondary">
			{boiler.fuel}{boiler.lastRefuelAt
				? ` · palivo doplněno v ${formatTime(boiler.lastRefuelAt)}`
				: ''}
		</p>
	</Card>
{/if}
