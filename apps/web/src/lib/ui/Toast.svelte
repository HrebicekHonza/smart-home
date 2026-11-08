<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';

	let { message }: { message: string } = $props();
</script>

<div
	role="status"
	class="fixed bottom-24 left-1/2 z-50 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-4 py-3 text-label shadow-toast md:bottom-6"
>
	<CircleCheck aria-hidden="true" class="size-[18px] flex-none text-success" />
	{message}
</div>
