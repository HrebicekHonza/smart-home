import { describe, expect, it } from 'vitest';
import { formatTemperature, formatTime } from './format.ts';

const NBSP = String.fromCharCode(0xa0);
const MINUS_SIGNS = ['-', String.fromCharCode(0x2212)];

describe('formatTemperature', () => {
	it('uses a decimal comma, one decimal place and a non-breaking unit', () => {
		expect(formatTemperature(21.5)).toBe(`21,5${NBSP}°C`);
		expect(formatTemperature(20)).toBe(`20,0${NBSP}°C`);
	});

	it('formats negative outdoor temperatures', () => {
		expect(MINUS_SIGNS.map((sign) => `${sign}3,2${NBSP}°C`)).toContain(formatTemperature(-3.2));
	});
});

describe('formatTime', () => {
	it('uses a 24-hour clock', () => {
		const afternoon = Date.UTC(2026, 0, 15, 13, 5);
		expect(formatTime(afternoon, 'Europe/Prague')).toBe('14:05');
	});
});
