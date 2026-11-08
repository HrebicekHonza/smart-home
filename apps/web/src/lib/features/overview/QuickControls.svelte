<script lang="ts">
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import { getHome } from '#lib/app/home-context.ts';
	import Card from '#lib/ui/Card.svelte';
	import Switch from '#lib/ui/Switch.svelte';

	const home = getHome();

	const lights = $derived(
		home.rooms.flatMap((room) =>
			room.devices.filter((device) => device.kind === 'light').map((device) => ({ room, device }))
		)
	);
</script>

{#if lights.length > 0}
	<Card title="Rychlé ovládání">
		<ul class="divide-y divide-border-subtle border-t border-border-subtle">
			{#each lights as { room, device } (device.id)}
				{@const pending = device.id in home.pendingLights}
				{@const on = home.pendingLights[device.id] ?? device.on ?? false}
				<li class="flex min-h-[60px] items-center gap-3 py-2.5 last:pb-0">
					<span
						class={[
							'flex size-10 flex-none items-center justify-center rounded-md',
							on ? 'bg-accent-muted text-accent' : 'bg-surface-raised text-text-secondary'
						]}
					>
						<Lightbulb aria-hidden="true" class="size-5" />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block text-label">{device.name}</span>
						<span class="block text-micro font-normal text-text-secondary">
							Zařízení · {room.name} · {pending ? 'odesílám…' : on ? 'zapnuto' : 'vypnuto'}
						</span>
					</span>
					<Switch
						checked={on}
						label={`${device.name}, ${room.name}`}
						disabled={!home.online}
						busy={pending}
						onchange={(next: boolean) => home.setLight(room, device.id, next)}
					/>
				</li>
			{/each}
		</ul>
	</Card>
{/if}
