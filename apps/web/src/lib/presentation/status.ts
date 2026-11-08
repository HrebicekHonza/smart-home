import CircleCheck from '@lucide/svelte/icons/circle-check';
import CircleMinus from '@lucide/svelte/icons/circle-minus';
import CirclePause from '@lucide/svelte/icons/circle-pause';
import Clock from '@lucide/svelte/icons/clock';
import Flame from '@lucide/svelte/icons/flame';
import WifiOff from '@lucide/svelte/icons/wifi-off';
import type { RoomStatus } from '@doma/core';
import type { Component } from 'svelte';
import type { Tone } from './tone.ts';

export interface StatusPresentation {
	readonly label: string;
	readonly icon: Component;
	readonly tone: Tone;
}

export const ROOM_STATUS: Record<RoomStatus, StatusPresentation> = {
	heating: { label: 'Topí', icon: Flame, tone: 'accent' },
	ok: { label: 'V cíli', icon: CircleCheck, tone: 'neutral' },
	above: { label: 'Nad cílem', icon: CircleMinus, tone: 'neutral' },
	paused: { label: 'Pozastaveno', icon: CirclePause, tone: 'warning' },
	stale: { label: 'Zastaralé', icon: Clock, tone: 'warning' },
	offline: { label: 'Odpojeno', icon: WifiOff, tone: 'danger' }
};

export const NEEDS_ATTENTION: ReadonlySet<RoomStatus> = new Set(['paused', 'stale', 'offline']);
