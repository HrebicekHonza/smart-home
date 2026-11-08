<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Chyba · Doma</title>
</svelte:head>

<h1 class="text-2xl font-bold md:text-3xl">
	{page.status === 404 ? 'Stránka neexistuje' : 'Něco se pokazilo'}
</h1>
<p class="mt-2 text-text-secondary">
	<a href={resolve('/')} class="text-accent underline underline-offset-4">Zpět na přehled</a>
</p>
