import { describe, expect, it } from 'vitest';
import {
	formatDay,
	formatDayTime,
	formatDuration,
	formatPercent,
	formatTemperature,
	formatTime
} from './format.ts';

const NBSP = String.fromCharCode(0xa0);
const MINUS_SIGNS = ['-', String.fromCharCode(0x2212)];
const local = (day: number, hours: number, minutes = 0) =>
	new Date(2026, 10, day, hours, minutes).getTime();

describe('formatTemperature', () => {
	it('uses a decimal comma, one decimal place and a non-breaking unit', () => {
		expect(formatTemperature(21.5)).toBe(`21,5${NBSP}°C`);
		expect(formatTemperature(20)).toBe(`20,0${NBSP}°C`);
	});

	it('formats negative outdoor temperatures', () => {
		expect(MINUS_SIGNS.map((sign) => `${sign}3,2${NBSP}°C`)).toContain(formatTemperature(-3.2));
	});
});

describe('formatPercent', () => {
	it('separates the unit with a non-breaking space', () => {
		expect(formatPercent(48)).toBe(`48${NBSP}%`);
	});
});

describe('time formatting', () => {
	it('uses a 24-hour clock with leading zeros', () => {
		expect(formatTime(local(8, 8, 24))).toBe('08:24');
		expect(formatTime(local(8, 22))).toBe('22:00');
	});

	it('marks times from the previous day', () => {
		expect(formatDayTime(local(7, 22), local(8, 8, 24))).toBe('včera 22:00');
		expect(formatDayTime(local(8, 6, 58), local(8, 8, 24))).toBe('06:58');
	});

	it('capitalises the weekday in the day heading', () => {
		expect(formatDay(local(8, 8, 24))).toBe('Neděle 8. listopadu');
	});
});

describe('formatDuration', () => {
	it.each([
		[12, `12${NBSP}min`],
		[60, `1${NBSP}h`],
		[192, `3${NBSP}h 12${NBSP}min`]
	])('formats %i minutes', (minutes, expected) => {
		expect(formatDuration(minutes)).toBe(expected);
	});
});
