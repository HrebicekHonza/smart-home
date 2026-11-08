<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class={['animate-skeleton rounded-md bg-surface-raised', className]}></div>
