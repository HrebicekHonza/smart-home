<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import { navigationItems } from '#lib/navigation.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a
	href="#main"
	class="sr-only z-50 rounded-control bg-accent px-4 py-3 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
>
	Přeskočit na obsah
</a>

<div class="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
	<nav
		aria-label="Hlavní navigace"
		class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:sticky md:top-0 md:h-dvh md:border-t-0 md:border-r"
	>
		<p class="hidden px-6 pt-8 pb-6 text-xl font-bold md:block">Doma</p>
		<ul class="flex justify-around md:flex-col md:gap-1 md:px-3">
			{#each navigationItems as item (item.route)}
				{@const current = page.route.id === item.route}
				<li>
					<a
						href={resolve(item.route)}
						aria-current={current ? 'page' : undefined}
						class={[
							'flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-control px-4 py-2 text-xs font-medium transition-colors md:flex-row md:justify-start md:gap-3 md:text-base',
							current
								? 'bg-surface-raised text-accent'
								: 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
						]}
					>
						<item.icon aria-hidden="true" class="size-5" />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<main id="main" tabindex="-1" class="px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-8">
		{@render children()}
	</main>
</div>
