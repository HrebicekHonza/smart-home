import House from '@lucide/svelte/icons/house';
import LogOut from '@lucide/svelte/icons/log-out';
import Moon from '@lucide/svelte/icons/moon';
import type { HomeMode } from '@doma/core';
import type { Component } from 'svelte';

export interface ModePresentation {
	readonly mode: HomeMode;
	readonly label: string;
	readonly icon: Component;
	readonly effect: string;
}

export const MODES: readonly ModePresentation[] = [
	{ mode: 'home', label: 'Doma', icon: House, effect: 'Místnosti topí podle svých rozvrhů.' },
	{
		mode: 'away',
		label: 'Pryč',
		icon: LogOut,
		effect: 'Všechny místnosti drží 17,0 °C, dokud režim nezměníte.'
	},
	{
		mode: 'night',
		label: 'Noc',
		icon: Moon,
		effect: 'Místnosti drží noční teploty z rozvrhu, dokud režim nezměníte.'
	}
];

export function modeLabel(mode: HomeMode): string {
	return MODES.find((candidate) => candidate.mode === mode)?.label ?? mode;
}
