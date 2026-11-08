<script lang="ts">
	import Flame from '@lucide/svelte/icons/flame';
</script>

<svelte:head>
	<title>Vytápění · Doma</title>
</svelte:head>

<h1 class="text-title-compact md:text-title">Vytápění</h1>

<section
	aria-labelledby="heating-status"
	class="mt-6 max-w-prose rounded-xl border border-dashed border-border bg-surface-sunken p-5"
>
	<h2 id="heating-status" class="flex items-center gap-3 text-heading">
		<Flame aria-hidden="true" class="size-5 text-accent" />
		Obrazovka se připravuje
	</h2>
	<p class="mt-2 text-text-secondary">
		Přehled všech místností, hromadná změna cíle a panel kotle přibudou, až bude obrazovka navržená.
		Místnosti zatím ovládáte z přehledu nebo detailu místnosti.
	</p>
</section>
