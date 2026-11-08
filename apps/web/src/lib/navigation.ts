import FlaskConical from '@lucide/svelte/icons/flask-conical';
import House from '@lucide/svelte/icons/house';
import type { RouteId } from '$app/types';
import type { Component } from 'svelte';

export interface NavigationItem {
	readonly route: RouteId;
	readonly label: string;
	readonly icon: Component;
}

export const navigationItems: readonly NavigationItem[] = [
	{ route: '/', label: 'Přehled', icon: House },
	{ route: '/simulator', label: 'Simulátor', icon: FlaskConical }
];
