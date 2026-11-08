import AppWindow from '@lucide/svelte/icons/app-window';
import Clock from '@lucide/svelte/icons/clock';
import WifiOff from '@lucide/svelte/icons/wifi-off';
import type { EpochMillis, RoomAlert } from '@doma/core';
import type { Component } from 'svelte';
import { formatDuration, formatTime, minutesBetween } from '#lib/format/format.ts';

export interface AlertPresentation {
	readonly title: string;
	readonly text: string;
	readonly icon: Component;
	readonly tone: 'warning' | 'danger';
}

const ICONS = { offline: WifiOff, 'window-open': AppWindow, stale: Clock } as const;

export function describeHomeAlert(
	alert: RoomAlert,
	roomName: string,
	now: EpochMillis
): AlertPresentation {
	switch (alert.kind) {
		case 'offline':
			return {
				title: `${roomName}: hlavice odpojená`,
				text: alert.since
					? `Naposledy odpověděla v ${formatTime(alert.since)}. Zkontrolujte baterii nebo dosah.`
					: 'Zkontrolujte baterii nebo dosah.',
				icon: ICONS.offline,
				tone: 'danger'
			};
		case 'window-open':
			return {
				title: `${roomName}: okno otevřené ${formatDuration(minutesBetween(alert.since, now))}`,
				text: 'Topení v místnosti je pozastavené, dokud se okno nezavře.',
				icon: ICONS['window-open'],
				tone: 'warning'
			};
		case 'stale':
			return {
				title: `${roomName}: zastaralé měření`,
				text: `Senzor neposlal hodnotu ${formatDuration(minutesBetween(alert.since, now))}.`,
				icon: ICONS.stale,
				tone: 'warning'
			};
	}
}

export function describeRoomAlert(alert: RoomAlert, now: EpochMillis): AlertPresentation {
	switch (alert.kind) {
		case 'offline':
			return {
				title: alert.since
					? `Hlavice neodpovídá od ${formatTime(alert.since)}`
					: 'Hlavice neodpovídá',
				text: 'Teplotu nelze měřit ani měnit. Zkontrolujte baterii nebo vzdálenost od brány.',
				icon: ICONS.offline,
				tone: 'danger'
			};
		case 'window-open':
			return {
				title: `Okno je otevřené ${formatDuration(minutesBetween(alert.since, now))}`,
				text: 'Topení je pozastavené. Nový cíl se uplatní po zavření okna.',
				icon: ICONS['window-open'],
				tone: 'warning'
			};
		case 'stale':
			return {
				title: `Měření je staré ${formatDuration(minutesBetween(alert.since, now))}`,
				text: 'Zobrazená teplota nemusí odpovídat skutečnosti. Hlavice dál reguluje podle posledního měření.',
				icon: ICONS.stale,
				tone: 'warning'
			};
	}
}

export function describeTileNote(alert: RoomAlert, now: EpochMillis): string {
	switch (alert.kind) {
		case 'offline':
			return alert.since ? `Bez odpovědi od ${formatTime(alert.since)}` : 'Bez odpovědi';
		case 'window-open':
			return `Okno otevřené ${formatDuration(minutesBetween(alert.since, now))}`;
		case 'stale':
			return `Měření před ${formatDuration(minutesBetween(alert.since, now))}`;
	}
}
