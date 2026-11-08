import { MINUTE_MS, type Celsius, type EpochMillis, type Percent } from '@doma/core';

const LOCALE = 'cs-CZ';
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

const decimalFormat = new Intl.NumberFormat(LOCALE, {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

const dayFormat = new Intl.DateTimeFormat(LOCALE, {
	weekday: 'long',
	day: 'numeric',
	month: 'long'
});

export function formatDecimal(value: number): string {
	return decimalFormat.format(value);
}

export function formatTemperature(value: Celsius): string {
	return `${formatDecimal(value)}${NO_BREAK_SPACE}°C`;
}

export function formatPercent(value: Percent): string {
	return `${Math.round(value)}${NO_BREAK_SPACE}%`;
}

export function formatTime(at: EpochMillis): string {
	return timeFormat.format(at);
}

export function formatDayTime(at: EpochMillis, now: EpochMillis): string {
	return isSameLocalDay(at, now) ? formatTime(at) : `včera ${formatTime(at)}`;
}

export function formatDay(at: EpochMillis): string {
	const day = dayFormat.format(at);
	return day.charAt(0).toLocaleUpperCase(LOCALE) + day.slice(1);
}

export function minutesBetween(from: EpochMillis, to: EpochMillis): number {
	return Math.max(0, Math.floor((to - from) / MINUTE_MS));
}

export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}${NO_BREAK_SPACE}min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0
		? `${hours}${NO_BREAK_SPACE}h`
		: `${hours}${NO_BREAK_SPACE}h ${rest}${NO_BREAK_SPACE}min`;
}

function isSameLocalDay(a: EpochMillis, b: EpochMillis): boolean {
	return new Date(a).toDateString() === new Date(b).toDateString();
}
