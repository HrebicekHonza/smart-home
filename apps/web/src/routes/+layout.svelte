<script lang="ts">
	import '../app.css';
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import { createHome, knownRoomIds } from '#lib/app/create-home.ts';
	import { simulatorOnly } from '#lib/app/edition.ts';
	import { setHome } from '#lib/app/home-context.ts';
	import AppShell from '#lib/shell/AppShell.svelte';
	import SimulatorShell from '#lib/shell/SimulatorShell.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const home = setHome(createHome(browser ? location.search : ''));

	onMount(() => (simulatorOnly ? undefined : home.start()));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if simulatorOnly}
	<SimulatorShell>
		{@render children()}
	</SimulatorShell>
{:else}
	<AppShell defaultRoomId={knownRoomIds[0] ?? ''}>
		{@render children()}
	</AppShell>
{/if}
