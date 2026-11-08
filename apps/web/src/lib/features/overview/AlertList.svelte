<script lang="ts">
	import { resolve } from '$app/paths';
	import { getHome } from '#lib/app/home-context.ts';
	import { describeHomeAlert } from '#lib/presentation/alerts.ts';
	import Notice from '#lib/ui/Notice.svelte';

	const home = getHome();
	const headingId = $props.id();
</script>

{#if home.alerts.length > 0}
	<section aria-labelledby={headingId}>
		<h2 id={headingId} class="mb-3 text-heading">
			Upozornění <span class="font-normal text-text-secondary">· {home.alerts.length}</span>
		</h2>
		<ul class="flex flex-col gap-2">
			{#each home.alerts as alert (alert.roomId + alert.kind)}
				{@const room = home.room(alert.roomId)}
				{#if room}
					<li>
						<Notice
							alert={describeHomeAlert(alert, room.name, home.now)}
							href={resolve('/mistnosti/[id]', { id: room.id })}
						/>
					</li>
				{/if}
			{/each}
		</ul>
	</section>
{/if}
