import type { Celsius, EpochMillis } from '@doma/core';

const LOCALE = 'cs-CZ';
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

const temperatureFormat = new Intl.NumberFormat(LOCALE, {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

export function formatTemperature(value: Celsius): string {
	return `${temperatureFormat.format(value)}${NO_BREAK_SPACE}°C`;
}

export function formatTime(at: EpochMillis, timeZone?: string): string {
	return new Intl.DateTimeFormat(LOCALE, {
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
		...(timeZone ? { timeZone } : {})
	}).format(at);
}
