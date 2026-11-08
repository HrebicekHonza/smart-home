import Activity from '@lucide/svelte/icons/activity';
import AppWindow from '@lucide/svelte/icons/app-window';
import Clock from '@lucide/svelte/icons/clock';
import Lightbulb from '@lucide/svelte/icons/lightbulb';
import Thermometer from '@lucide/svelte/icons/thermometer';
import WifiOff from '@lucide/svelte/icons/wifi-off';
import { isStale, type Device, type EpochMillis, type Room } from '@doma/core';
import type { Component } from 'svelte';
import { formatDuration, formatPercent, formatTime, minutesBetween } from '#lib/format/format.ts';
import type { Tone } from './tone.ts';

export interface DevicePresentation {
	readonly icon: Component;
	readonly detail: string;
	readonly tone: Tone;
}

export function describeDevice(device: Device, room: Room, now: EpochMillis): DevicePresentation {
	if (!device.online) {
		return {
			icon: WifiOff,
			detail: device.lastSeenAt
				? `Bez odpovědi od ${formatTime(device.lastSeenAt)}`
				: 'Bez odpovědi',
			tone: 'danger'
		};
	}

	switch (device.kind) {
		case 'trv':
			return {
				icon: Thermometer,
				detail:
					room.window.state === 'open'
						? `Ventil ${formatPercent(0)} · pozastaveno oknem`
						: [
								device.valve !== undefined && `Ventil ${formatPercent(device.valve)}`,
								device.battery !== undefined && `baterie ${formatPercent(device.battery)}`
							]
								.filter(Boolean)
								.join(' · '),
				tone: 'neutral'
			};
		case 'climate-sensor':
			if (device.lastSeenAt !== null && isStale({ at: device.lastSeenAt }, now)) {
				return {
					icon: Clock,
					detail: `Poslední měření v ${formatTime(device.lastSeenAt)}`,
					tone: 'warning'
				};
			}
			return {
				icon: Activity,
				detail:
					device.lastSeenAt === null
						? 'Bez měření'
						: `Měření před ${formatDuration(minutesBetween(device.lastSeenAt, now))}`,
				tone: 'neutral'
			};
		case 'window-contact':
			return {
				icon: AppWindow,
				detail:
					room.window.state === 'open' ? `Otevřeno od ${formatTime(room.window.since)}` : 'Zavřeno',
				tone: room.window.state === 'open' ? 'warning' : 'neutral'
			};
		case 'light':
			return { icon: Lightbulb, detail: device.on ? 'Zapnuto' : 'Vypnuto', tone: 'neutral' };
	}
}
