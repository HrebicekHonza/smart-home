<script lang="ts">
	import type { Room } from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import { describeDevice } from '#lib/presentation/devices.ts';
	import { TONE_TEXT } from '#lib/presentation/tone.ts';
	import Card from '#lib/ui/Card.svelte';
	import Switch from '#lib/ui/Switch.svelte';

	let { room }: { room: Room } = $props();

	const home = getHome();
</script>

<Card title="Zařízení">
	{#snippet aside()}
		<span class="text-caption text-text-secondary">{room.devices.length} zařízení</span>
	{/snippet}
	<ul class="divide-y divide-border-subtle">
		{#each room.devices as device (device.id)}
			{@const presentation = describeDevice(device, room, home.now)}
			<li class="flex min-h-[60px] items-center gap-3 py-2.5 first:pt-0 last:pb-0">
				<span
					class="flex size-10 flex-none items-center justify-center rounded-md bg-surface-raised"
				>
					<presentation.icon aria-hidden="true" class={['size-5', TONE_TEXT[presentation.tone]]} />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block text-label">{device.name}</span>
					<span
						class={[
							'block text-micro font-normal',
							presentation.tone === 'danger' ? 'text-danger-text' : 'text-text-secondary'
						]}
					>
						{presentation.detail}
					</span>
				</span>
				{#if device.kind === 'light'}
					<Switch
						checked={home.pendingLights[device.id] ?? device.on ?? false}
						label={`${device.name}, ${room.name}`}
						disabled={!home.online}
						busy={device.id in home.pendingLights}
						onchange={(on: boolean) => home.setLight(room, device.id, on)}
					/>
				{:else}
					<span class="font-mono text-axis text-text-tertiary">{device.id}</span>
				{/if}
			</li>
		{/each}
	</ul>
</Card>
