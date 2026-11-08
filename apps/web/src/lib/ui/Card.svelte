<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		aside,
		children,
		class: className = ''
	}: { title: string; aside?: Snippet; children: Snippet; class?: string } = $props();

	const headingId = $props.id();
</script>

<section aria-labelledby={headingId} class={['rounded-xl bg-surface p-[18px] md:p-5', className]}>
	<header class="mb-3 flex items-center justify-between gap-3">
		<h2 id={headingId} class="text-heading">{title}</h2>
		{@render aside?.()}
	</header>
	{@render children()}
</section>
