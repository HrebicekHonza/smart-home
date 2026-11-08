<script lang="ts">
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { CONTROLLER_KINDS, REFERENCE_WEATHER, roomTimeConstant } from '@doma/simulation';
	import { formatDuration, formatNumber } from '#lib/format/format.ts';
	import { CONTROLLERS } from './controllers.ts';
	import NumberField from './NumberField.svelte';
	import type { SimulatorState, WeatherChoice } from './simulator-state.svelte.ts';

	let { simulator }: { simulator: SimulatorState } = $props();

	const WEATHER: readonly { value: WeatherChoice; label: string }[] = [
		{
			value: 'base',
			label: `Základní (${formatNumber(REFERENCE_WEATHER.base.mean, 0)} ± ${REFERENCE_WEATHER.base.amplitude} °C)`
		},
		{
			value: 'frost',
			label: `Mrazivý (${formatNumber(REFERENCE_WEATHER.frost.mean, 0)} ± ${REFERENCE_WEATHER.frost.amplitude} °C)`
		},
		{ value: 'custom', label: 'Vlastní' }
	];

	const timeConstant = $derived(
		simulator.params ? formatDuration(Math.round(roomTimeConstant(simulator.params) / 60)) : '—'
	);

	const section = 'flex flex-col gap-3 rounded-xl bg-surface p-4';
	const check = 'size-5 flex-none accent-accent';
</script>

<div class="flex flex-col gap-3">
	<section aria-labelledby="sim-room" class={section}>
		<header class="flex items-center justify-between gap-3">
			<h2 id="sim-room" class="text-heading">Místnost</h2>
			<button
				type="button"
				onclick={() => simulator.resetToReference()}
				class="flex min-h-11 items-center gap-1.5 rounded-md px-2 text-label text-accent hover:bg-accent-muted"
			>
				<RotateCcw aria-hidden="true" class="size-4" />
				Pracovna
			</button>
		</header>
		<NumberField
			label="Tepelná kapacita C"
			unit="MJ/K"
			step={0.01}
			min={0.01}
			bind:value={() => simulator.room.C / 1e6, (value) => (simulator.room.C = value * 1e6)}
		/>
		<NumberField
			label="Tepelný odpor R"
			unit="K/W"
			step={0.001}
			min={0.001}
			bind:value={simulator.room.R}
		/>
		<NumberField
			label="Odpor otevřeného okna"
			unit="K/W"
			step={0.001}
			min={0.001}
			bind:value={simulator.room.Rwindow}
		/>
		<NumberField
			label="Výkon radiátoru"
			unit="W"
			step={50}
			min={50}
			bind:value={simulator.room.Pmax}
		/>
		<NumberField
			label="Setrvačnost radiátoru"
			unit="s"
			step={60}
			min={0}
			bind:value={simulator.room.tauHeater}
		/>
		<NumberField label="Počáteční teplota" unit="°C" step={0.5} bind:value={simulator.room.T0} />
		<p class="text-micro font-normal text-text-tertiary">
			Časová konstanta místnosti τ = R·C: <span class="font-mono">{timeConstant}</span>
		</p>
		{#if !simulator.params}
			<p role="alert" class="rounded-md bg-danger-bg px-3 py-2 text-caption text-danger-text">
				Kapacita, odpory a výkon musí být kladné.
			</p>
		{/if}
	</section>

	<fieldset class={section}>
		<legend class="float-left mb-1 text-heading">Regulátory</legend>
		{#each CONTROLLER_KINDS as kind (kind)}
			<label class="flex min-h-11 cursor-pointer items-center gap-3 text-label">
				<input type="checkbox" bind:checked={simulator.enabled[kind]} class={check} />
				<span class={['h-0.5 w-4 flex-none rounded-full', CONTROLLERS[kind].swatch]}></span>
				{CONTROLLERS[kind].label}
			</label>
		{/each}
		<NumberField
			label="Pásmo hlavice Xp"
			unit="K"
			step={0.5}
			min={0.5}
			bind:value={simulator.valveBand}
		/>
		<NumberField
			label="Hystereze termostatu"
			unit="K"
			step={0.05}
			min={0.05}
			bind:value={simulator.hysteresis}
		/>
		<label class="flex min-h-11 cursor-pointer items-center gap-3 text-label">
			<input
				type="checkbox"
				bind:checked={
					() => simulator.autoTuning, (value: boolean) => simulator.setAutoTuning(value)
				}
				class={check}
			/>
			PI podle Ziegler–Nicholse
		</label>
		{#if simulator.autoTuning}
			<p class="font-mono text-micro font-normal text-text-secondary">
				{#if simulator.derivedTuning.status === 'ok'}
					K = {formatNumber(simulator.derivedTuning.K, 1)} W/K · Ti = {formatNumber(
						simulator.derivedTuning.Ti,
						0
					)} s
				{:else}
					Bez setrvačnosti radiátoru nemá odezva průtah, metodu nelze použít.
				{/if}
			</p>
		{:else}
			<NumberField label="Zesílení K" unit="W/K" step={10} min={0} bind:value={simulator.manualK} />
			<NumberField
				label="Integrační konstanta Ti"
				unit="s"
				step={60}
				min={0}
				bind:value={simulator.manualTi}
			/>
		{/if}
		{#if simulator.piUnavailable}
			<p role="status" class="rounded-md bg-warning-bg px-3 py-2 text-caption text-warning-text">
				PI regulátory se nesimulují, dokud nejsou známé K a Ti.
			</p>
		{/if}
	</fieldset>

	<fieldset class={section}>
		<legend class="float-left mb-1 text-heading">Scénář</legend>
		<label class="grid gap-1 text-caption text-text-secondary">
			Venkovní teplota
			<select
				bind:value={simulator.weather}
				class="h-11 rounded-sm border border-border-strong bg-surface-sunken px-2.5 text-label text-text-primary"
			>
				{#each WEATHER as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
		{#if simulator.weather === 'custom'}
			<NumberField label="Průměr" unit="°C" step={1} bind:value={simulator.customMean} />
			<NumberField
				label="Amplituda"
				unit="°C"
				step={1}
				min={0}
				bind:value={simulator.customAmplitude}
			/>
		{/if}
		<label class="flex min-h-11 cursor-pointer items-center gap-3 text-label">
			<input type="checkbox" bind:checked={simulator.windowOpen} class={check} />
			Otevřené okno
		</label>
		{#if simulator.windowOpen}
			<NumberField
				label="Otevřít v"
				unit="h"
				step={0.5}
				min={0}
				max={23.5}
				bind:value={simulator.windowFromHour}
			/>
			<NumberField label="Délka" unit="min" step={5} min={5} bind:value={simulator.windowMinutes} />
		{/if}
		<label class="flex min-h-11 cursor-pointer items-center gap-3 text-label">
			<input type="checkbox" bind:checked={simulator.setback} class={check} />
			Noční útlum 22:00–06:00
		</label>
		<NumberField
			label="Žádaná teplota přes den"
			unit="°C"
			step={0.5}
			bind:value={simulator.daySetpoint}
		/>
		{#if simulator.setback}
			<NumberField
				label="Žádaná teplota v noci"
				unit="°C"
				step={0.5}
				bind:value={simulator.nightSetpoint}
			/>
		{/if}
		<p class="font-mono text-micro font-normal text-text-tertiary">
			24 h od půlnoci · krok {simulator.dt}&nbsp;s · Euler
		</p>
	</fieldset>
</div>
