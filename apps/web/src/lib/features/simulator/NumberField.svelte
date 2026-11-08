<script lang="ts">
	let {
		label,
		unit,
		value = $bindable(),
		step,
		min,
		max,
		disabled = false
	}: {
		label: string;
		unit: string;
		value: number;
		step: number;
		min?: number;
		max?: number;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
</script>

<div class="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
	<label for={id} class="text-caption text-text-secondary">{label}</label>
	<span class="flex items-center gap-1.5">
		<input
			{id}
			type="number"
			bind:value
			{step}
			{min}
			{max}
			{disabled}
			class="h-10 w-28 rounded-sm border border-border-strong bg-surface-sunken px-2.5 text-right font-mono text-caption tabular-nums disabled:text-text-disabled"
		/>
		<span class="w-12 font-mono text-axis text-text-tertiary">{unit}</span>
	</span>
</div>
