<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import { DEFAULT_SETPOINT_LIMITS, overrideUntil, type Room } from '@doma/core';
	import { getHome } from '#lib/app/home-context.ts';
	import { formatDecimal, formatTemperature } from '#lib/format/format.ts';
	import {
		OVERRIDE_DURATIONS,
		overrideExplanation,
		targetSourceLabel,
		targetValidityLabel
	} from '#lib/presentation/target.ts';
	import Card from '#lib/ui/Card.svelte';
	import ScopeChip from '#lib/ui/ScopeChip.svelte';
	import CommandStatus from './CommandStatus.svelte';

	let { room }: { room: Room } = $props();

	const home = getHome();
	const { min, max, step } = DEFAULT_SETPOINT_LIMITS;
	const durationGroup = $props.id();

	const target = $derived(home.target(room));
	const draft = $derived(home.draft(room));
	const changed = $derived(draft !== target.target);
	const command = $derived(home.targetCommand(room.id));
	const pending = $derived(command.status === 'pending');
	const controllable = $derived(home.canControl(room));
	const measured = $derived(room.latest?.temperature ?? null);

	const explanation = $derived.by(() => {
		if (!home.online) return 'Ovládání je bez spojení nedostupné.';
		if (!controllable) return 'Hlavice je odpojená, změnu nelze odeslat.';
		return overrideExplanation(
			overrideUntil(home.overrideDuration, home.now, room.schedule),
			home.mode
		);
	});

	const stepButton =
		'flex size-15 items-center justify-center rounded-xl bg-surface-raised text-text-primary transition-colors duration-150 ease-out hover:bg-surface-raised-hover disabled:text-text-disabled disabled:hover:bg-surface-raised';
</script>

<Card title="Požadovaná teplota">
	{#snippet aside()}
		<ScopeChip label={`Místnost · ${room.name}`} />
	{/snippet}

	<div
		class="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md bg-surface-sunken px-3 py-2 text-caption text-text-secondary"
	>
		<p>
			Nyní platí
			<strong class="font-semibold text-text-primary">
				{targetSourceLabel(target)}
				{formatTemperature(target.target)}
			</strong>
			· {targetValidityLabel(target)}
		</p>
		{#if target.source === 'manual'}
			<button
				type="button"
				disabled={!home.online}
				onclick={() => home.cancelOverride(room)}
				class="min-h-11 rounded-md px-2 text-label text-accent hover:bg-accent-muted disabled:text-text-disabled"
			>
				Zrušit změnu
			</button>
		{/if}
	</div>

	<div class="my-5 grid grid-cols-[60px_1fr_60px] items-center gap-3">
		<button
			type="button"
			aria-label={`Snížit o ${formatDecimal(step)} °C`}
			disabled={!controllable || draft <= min}
			onclick={() => home.adjustDraft(room, -1)}
			class={stepButton}
		>
			<Minus aria-hidden="true" class="size-6" />
		</button>
		<div class="text-center" aria-live="polite">
			<p
				data-testid="target-draft"
				class={[
					'text-stepper-compact tabular-nums md:text-stepper',
					changed ? 'text-accent' : 'text-text-primary'
				]}
			>
				{formatDecimal(draft)}<span class="unit">°C</span>
			</p>
			<p class="mt-1.5 text-micro font-normal text-text-secondary">
				{#if changed}
					Nový cíl · nyní {formatTemperature(target.target)}
				{:else}
					Naměřeno {measured === null ? '—' : formatTemperature(measured)} · rozsah {min}–{max}&nbsp;°C
				{/if}
			</p>
		</div>
		<button
			type="button"
			aria-label={`Zvýšit o ${formatDecimal(step)} °C`}
			disabled={!controllable || draft >= max}
			onclick={() => home.adjustDraft(room, 1)}
			class={stepButton}
		>
			<Plus aria-hidden="true" class="size-6" />
		</button>
	</div>

	<fieldset>
		<legend class="mb-2 text-label font-normal text-text-secondary">Platnost ruční změny</legend>
		<div class="flex flex-wrap gap-2">
			{#each OVERRIDE_DURATIONS as option (option.value)}
				{@const selected = home.overrideDuration === option.value}
				<label
					class={[
						'flex min-h-11 items-center rounded-sm border px-3 text-label transition-colors duration-150 ease-out has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
						selected
							? 'border-accent-muted-border bg-accent-muted text-accent'
							: 'border-border hover:bg-surface-hover',
						controllable ? 'cursor-pointer' : 'cursor-not-allowed text-text-disabled'
					]}
				>
					<input
						type="radio"
						name={durationGroup}
						value={option.value}
						checked={selected}
						disabled={!controllable}
						onchange={() => (home.overrideDuration = option.value)}
						class="sr-only"
					/>
					{option.label}
				</label>
			{/each}
		</div>
	</fieldset>

	<div
		class="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<p class="text-caption text-text-secondary">{explanation}</p>
		<button
			type="button"
			disabled={!controllable || pending || !changed}
			onclick={() => home.submitTarget(room)}
			class="min-h-12 flex-none rounded-md bg-accent px-5 text-label text-on-accent transition-colors duration-150 ease-out hover:bg-accent-hover focus-visible:outline-text-primary disabled:bg-surface-raised disabled:text-text-tertiary"
		>
			{#if pending}
				Odesílám…
			{:else if changed}
				Nastavit {formatTemperature(draft)}
			{:else}
				Beze změny
			{/if}
		</button>
	</div>

	<CommandStatus {command} {target} onretry={() => home.submitTarget(room)} />
</Card>
