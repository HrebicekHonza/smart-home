import AppWindow from '@lucide/svelte/icons/app-window';
import Clock from '@lucide/svelte/icons/clock';
import Flame from '@lucide/svelte/icons/flame';
import Lightbulb from '@lucide/svelte/icons/lightbulb';
import Moon from '@lucide/svelte/icons/moon';
import Thermometer from '@lucide/svelte/icons/thermometer';
import WifiOff from '@lucide/svelte/icons/wifi-off';
import type { HomeEvent, Room } from '@doma/core';
import type { Component } from 'svelte';
import { formatTemperature, formatTime } from '#lib/format/format.ts';
import { MODES, modeLabel } from './mode.ts';
import type { Tone } from './tone.ts';

export interface EventPresentation {
	readonly title: string;
	readonly detail: string;
	readonly icon: Component;
	readonly tone: Tone;
}

export function describeEvent(event: HomeEvent, rooms: readonly Room[]): EventPresentation {
	const roomName = (id: string) => rooms.find((room) => room.id === id)?.name ?? id;
	const deviceName = (roomId: string, deviceId: string) =>
		rooms.find((room) => room.id === roomId)?.devices.find((device) => device.id === deviceId)
			?.name ?? deviceId;

	switch (event.kind) {
		case 'mode-changed':
			return {
				title: `Celá domácnost · režim ${modeLabel(event.mode)}`,
				detail: 'Nastaveno ručně',
				icon: MODES.find((mode) => mode.mode === event.mode)?.icon ?? Clock,
				tone: 'accent'
			};
		case 'override-set':
			return {
				title: `${roomName(event.roomId)} · ruční změna`,
				detail: `Cíl ${formatTemperature(event.target)} ${event.until === null ? 'trvale' : `do ${formatTime(event.until)}`}`,
				icon: Thermometer,
				tone: 'accent'
			};
		case 'override-cancelled':
			return {
				title: `${roomName(event.roomId)} · ruční změna zrušena`,
				detail: 'Platí opět rozvrh nebo režim',
				icon: Clock,
				tone: 'neutral'
			};
		case 'window-opened':
			return {
				title: `${roomName(event.roomId)} · okno otevřeno`,
				detail: 'Topení v místnosti pozastaveno',
				icon: AppWindow,
				tone: 'warning'
			};
		case 'window-closed':
			return {
				title: `${roomName(event.roomId)} · okno zavřeno`,
				detail: 'Topení pokračuje',
				icon: AppWindow,
				tone: 'neutral'
			};
		case 'device-offline':
			return {
				title: `${roomName(event.roomId)} · ${deviceName(event.roomId, event.deviceId).toLocaleLowerCase('cs-CZ')} odpojena`,
				detail: 'Bez odpovědi',
				icon: WifiOff,
				tone: 'danger'
			};
		case 'schedule-applied':
			return {
				title: `Rozvrh · ${event.period === 'day' ? 'denní' : 'noční'} teploty`,
				detail: roomCount(event.roomCount),
				icon: event.period === 'day' ? Clock : Moon,
				tone: event.period === 'day' ? 'accent' : 'neutral'
			};
		case 'fuel-refilled':
			return {
				title: 'Kotel · palivo doplněno',
				detail: 'Zapsáno ručně',
				icon: Flame,
				tone: 'neutral'
			};
		case 'light-switched':
			return {
				title: `${roomName(event.roomId)} · ${deviceName(event.roomId, event.deviceId).toLocaleLowerCase('cs-CZ')}`,
				detail: event.on ? 'Zapnuto ručně' : 'Vypnuto ručně',
				icon: Lightbulb,
				tone: 'neutral'
			};
	}
}

function roomCount(count: number): string {
	if (count === 1) return '1 místnost';
	if (count >= 2 && count <= 4) return `${count} místnosti`;
	return `${count} místností`;
}
