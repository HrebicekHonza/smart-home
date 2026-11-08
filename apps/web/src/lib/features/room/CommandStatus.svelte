<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import type { CommandFailure, EffectiveTarget } from '@doma/core';
	import { formatTemperature } from '#lib/format/format.ts';
	import { targetValidityLabel } from '#lib/presentation/target.ts';
	import type { CommandState } from '#lib/state/home-state.svelte.ts';

	let {
		command,
		target,
		onretry
	}: { command: CommandState; target: EffectiveTarget; onretry: () => void } = $props();

	const FAILURE_TEXT: Record<CommandFailure, string> = {
		'device-offline': 'Hlavice neodpovídá. Původní cíl zůstává.',
		offline: 'Domácí server je nedostupný. Původní cíl zůstává.',
		partial: 'Jedna z hlavic nepotvrdila změnu. Původní cíl zůstává.',
		timeout: 'Hlavice nepotvrdily změnu včas. Původní cíl zůstává.'
	};
</script>

<div role="status">
	{#if command.status === 'pending'}
		<p class="mt-4 flex items-start gap-3 rounded-lg bg-surface-sunken px-3.5 py-3">
			<Ellipsis aria-hidden="true" class="mt-0.5 size-5 flex-none text-accent" />
			<span>
				<span class="block text-label font-semibold">Odesílám do hlavic</span>
				<span class="block text-caption text-text-secondary">
					Čekám na potvrzení ze zařízení v místnosti.
				</span>
			</span>
		</p>
	{:else if command.status === 'confirmed'}
		<p class="mt-4 flex items-start gap-3 rounded-lg bg-success-bg px-3.5 py-3">
			<CircleCheck aria-hidden="true" class="mt-0.5 size-5 flex-none text-success" />
			<span>
				<span class="block text-label font-semibold">
					Cíl {formatTemperature(command.target)} nastaven
				</span>
				<span class="block text-caption text-success-text">
					Hlavice potvrdily změnu {targetValidityLabel(target)}.
				</span>
			</span>
		</p>
	{:else if command.status === 'failed'}
		<div class="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-danger-bg px-3.5 py-3">
			<CircleX aria-hidden="true" class="size-5 flex-none text-danger" />
			<p class="min-w-0 flex-1">
				<span class="block text-label font-semibold">Příkaz se nepodařilo provést</span>
				<span class="block text-caption text-danger-text">{FAILURE_TEXT[command.reason]}</span>
			</p>
			{#if command.reason !== 'device-offline'}
				<button
					type="button"
					onclick={onretry}
					class="min-h-11 rounded-md bg-surface-raised px-4 text-label hover:bg-surface-raised-hover"
				>
					Zkusit znovu
				</button>
			{/if}
		</div>
	{/if}
</div>
