<script lang="ts">
	import type { RoomStatus } from '@doma/core';
	import { ROOM_STATUS } from '#lib/presentation/status.ts';
	import { TONE_TEXT } from '#lib/presentation/tone.ts';

	let { status, size = 'label' }: { status: RoomStatus; size?: 'label' | 'micro' } = $props();

	const presentation = $derived(ROOM_STATUS[status]);
</script>

<span
	class={[
		'inline-flex flex-none items-center gap-1.5 whitespace-nowrap',
		size === 'label' ? 'text-label' : 'text-micro',
		TONE_TEXT[presentation.tone]
	]}
>
	<presentation.icon aria-hidden="true" class={size === 'label' ? 'size-[15px]' : 'size-[13px]'} />
	{presentation.label}
</span>
