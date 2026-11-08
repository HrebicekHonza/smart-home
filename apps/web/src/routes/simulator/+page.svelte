<script lang="ts">
	import Unplug from '@lucide/svelte/icons/unplug';
</script>

<svelte:head>
	<title>Simulátor · Doma</title>
</svelte:head>

<h1 class="text-2xl font-bold md:text-3xl">Simulátor</h1>

<section
	aria-labelledby="simulation-status"
	class="mt-6 max-w-prose rounded-card border border-border bg-surface p-6"
>
	<h2 id="simulation-status" class="flex items-center gap-3 text-lg font-semibold">
		<Unplug aria-hidden="true" class="size-5 text-accent" />
		Simulační jádro není připojeno
	</h2>
	<p class="mt-2 text-text-secondary">
		Tepelný model místnosti a regulátory dodá samostatný balíček. Dokud není potvrzený jeho
		kontrakt, stránka nezobrazuje žádné výsledky simulace.
	</p>
</section>
