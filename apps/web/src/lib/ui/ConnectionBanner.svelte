<script lang="ts">
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import type { EpochMillis } from '@doma/core';
	import { formatTime } from '#lib/format/format.ts';

	let { lastSyncAt }: { lastSyncAt: EpochMillis } = $props();
</script>

<div role="alert" class="mb-6 flex items-start gap-3 rounded-lg bg-danger-bg px-3.5 py-3">
	<WifiOff aria-hidden="true" class="mt-0.5 size-5 flex-none text-danger" />
	<p>
		<span class="block text-label font-semibold">Bez spojení s domácím serverem</span>
		<span class="block text-caption text-danger-text">
			Zobrazuji poslední známá data z {formatTime(lastSyncAt)}. Ovládání je do obnovení spojení
			nedostupné.
		</span>
	</p>
</div>
