<script lang="ts">
	import Skeleton from '#lib/ui/Skeleton.svelte';
</script>

<div class="grid grid-cols-2 gap-3" aria-hidden="true">
	{#each [1, 2, 3, 4] as tile (tile)}
		<div
			class="flex min-h-[156px] flex-col gap-3 rounded-xl bg-surface p-3.5 md:min-h-[178px] md:p-[18px]"
		>
			<Skeleton class="h-4 w-2/5" />
			<Skeleton class="h-10 w-3/5" />
			<Skeleton class="mt-auto h-3 w-1/2" />
		</div>
	{/each}
</div>
