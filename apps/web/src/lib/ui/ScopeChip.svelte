<script lang="ts">
	let { label }: { label: string } = $props();
</script>

<span
	class="flex-none rounded-[8px] border border-border px-2 py-[3px] text-micro whitespace-nowrap text-text-secondary"
>
	{label}
</span>
