<script lang="ts">
	import { getHome } from '#lib/app/home-context.ts';
	import { MODES } from '#lib/presentation/mode.ts';
	import ScopeChip from '#lib/ui/ScopeChip.svelte';

	const home = getHome();
	const labelId = $props.id();

	const shown = $derived(home.pendingMode ?? home.mode);
	const effect = $derived.by(() => {
		if (home.pendingMode) return 'Přepínám režim pro celou domácnost…';
		const base = MODES.find((mode) => mode.mode === home.mode)?.effect ?? '';
		return home.hasActiveOverride ? `${base} Ruční změny v místnostech mají přednost.` : base;
	});
	const disabled = $derived(!home.online || home.pendingMode !== null);
</script>

<div class="w-full lg:w-[400px]">
	<div class="mb-2 flex items-center justify-between gap-3">
		<span id={labelId} class="text-label text-text-secondary">Režim</span>
		<ScopeChip label="Celá domácnost" />
	</div>
	<div
		role="group"
		aria-labelledby={labelId}
		class="grid grid-cols-3 gap-1 rounded-lg bg-surface-sunken p-1"
	>
		{#each MODES as mode (mode.mode)}
			{@const active = shown === mode.mode}
			<button
				type="button"
				aria-pressed={active}
				{disabled}
				onclick={() => home.setMode(mode.mode)}
				class={[
					'flex min-h-12 items-center justify-center gap-2 rounded-[11px] text-body font-medium transition-colors duration-150 ease-out',
					active
						? 'bg-accent text-on-accent focus-visible:outline-text-primary'
						: disabled
							? 'text-text-disabled'
							: 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
				]}
			>
				<mode.icon aria-hidden="true" class="size-[18px]" />
				{mode.label}{home.pendingMode === mode.mode ? '…' : ''}
			</button>
		{/each}
	</div>
	<p class="mt-2 text-caption text-text-secondary" aria-live="polite">{effect}</p>
</div>
