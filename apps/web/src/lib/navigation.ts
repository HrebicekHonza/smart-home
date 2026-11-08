import ChartLine from '@lucide/svelte/icons/chart-line';
import Flame from '@lucide/svelte/icons/flame';
import House from '@lucide/svelte/icons/house';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import type { Component } from 'svelte';

export interface NavigationItem {
	readonly route: '/' | '/mistnosti/[id]' | '/vytapeni' | '/simulator';
	readonly label: string;
	readonly icon: Component;
}

export const navigationItems: readonly NavigationItem[] = [
	{ route: '/', label: 'Přehled', icon: House },
	{ route: '/mistnosti/[id]', label: 'Místnosti', icon: LayoutGrid },
	{ route: '/vytapeni', label: 'Vytápění', icon: Flame },
	{ route: '/simulator', label: 'Simulátor', icon: ChartLine }
];
