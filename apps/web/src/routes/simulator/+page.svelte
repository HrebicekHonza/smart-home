<script lang="ts">
	import Unplug from '@lucide/svelte/icons/unplug';
</script>

<svelte:head>
	<title>Simulátor · Doma</title>
</svelte:head>

<h1 class="text-title-compact md:text-title">Simulátor</h1>

<section
	aria-labelledby="simulation-status"
	class="mt-6 max-w-prose rounded-xl border border-dashed border-border bg-surface-sunken p-5"
>
	<h2 id="simulation-status" class="flex items-center gap-3 text-heading">
		<Unplug aria-hidden="true" class="size-5 text-accent" />
		Simulační jádro není připojeno
	</h2>
	<p class="mt-2 text-text-secondary">
		Tepelný model místnosti a regulátory dodá samostatný balíček. Dokud není potvrzený jeho
		kontrakt, stránka nezobrazuje žádné výsledky simulace.
	</p>
</section>
