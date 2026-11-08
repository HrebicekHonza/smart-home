<script lang="ts">
	let {
		checked,
		label,
		disabled = false,
		busy = false,
		onchange
	}: {
		checked: boolean;
		label: string;
		disabled?: boolean;
		busy?: boolean;
		onchange: (checked: boolean) => void;
	} = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	aria-busy={busy}
	disabled={disabled || busy}
	onclick={() => onchange(!checked)}
	class="group flex h-11 w-15 flex-none items-center justify-center rounded-lg disabled:opacity-50"
>
	<span
		class={[
			'relative h-7 w-12 rounded-lg border transition-colors duration-150 ease-out',
			checked ? 'border-accent bg-accent' : 'border-border-strong bg-surface-sunken'
		]}
	>
		<span
			class={[
				'absolute top-[3px] size-5 rounded-full transition-[left] duration-150 ease-out',
				checked ? 'left-[23px] bg-on-accent' : 'left-[3px] bg-text-secondary'
			]}
		></span>
	</span>
</button>
