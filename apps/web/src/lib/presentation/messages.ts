import type { Celsius, HomeMode } from '@doma/core';
import { formatTemperature } from '#lib/format/format.ts';
import { modeLabel } from './mode.ts';

export const messages = {
	modeChanged: (mode: HomeMode) => `Režim ${modeLabel(mode)} platí pro celou domácnost`,
	targetSet: (roomName: string, target: Celsius) =>
		`${roomName}: cíl ${formatTemperature(target)} nastaven`,
	overrideCancelled: (roomName: string, mode: HomeMode) =>
		`${roomName}: platí opět ${mode === 'home' ? 'rozvrh' : 'režim'}`,
	lightSwitched: (roomName: string, deviceName: string, on: boolean) =>
		`${roomName}: ${deviceName.toLocaleLowerCase('cs-CZ')} ${on ? 'zapnuto' : 'vypnuto'}`,
	commandFailed: 'Příkaz se nepodařilo provést'
} as const;
