<script lang="ts">
	import ChartLine from '@lucide/svelte/icons/chart-line';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-accent px-4 py-3 text-label text-on-accent focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-text-primary"
>
	Přeskočit na obsah
</a>

<header class="border-b border-surface px-4 py-3 md:px-8">
	<p class="mx-auto flex max-w-[1360px] items-center gap-3 text-label">
		<span class="flex size-9 items-center justify-center rounded-md bg-accent text-on-accent">
			<ChartLine aria-hidden="true" class="size-5" />
		</span>
		Simulátor vytápění místnosti
	</p>
</header>

<main id="main" tabindex="-1" class="px-4 pt-5 pb-10 md:px-8 md:pt-7">
	<div class="mx-auto max-w-[1360px]">
		{@render children()}
	</div>
</main>
