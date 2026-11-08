import { describe, expect, it } from 'vitest';
import { at, room } from './fixtures.test-support.ts';
import { homeAlerts, roomStatus } from './status.ts';
import { MINUTE_MS } from './units.ts';

const now = at(8, 24);
const measured = (temperature: number) => ({ at: now - MINUTE_MS, temperature, humidity: 50 });

describe('roomStatus', () => {
	it.each([
		[21.7, 'heating'],
		[21.8, 'ok'],
		[22.5, 'ok'],
		[22.6, 'above']
	] as const)('measured %s °C against 22 °C is %s', (temperature, status) => {
		expect(roomStatus(room({ latest: measured(temperature) }), 22, now)).toBe(status);
	});

	it('pauses heating while a window is open', () => {
		const open = room({ window: { state: 'open', since: now - 12 * MINUTE_MS } });
		expect(roomStatus(open, 22, now)).toBe('paused');
	});

	it('reports a stale measurement before an open window', () => {
		const stale = room({
			latest: { at: now - 47 * MINUTE_MS, temperature: 18.4, humidity: 49 },
			window: { state: 'open', since: now }
		});
		expect(roomStatus(stale, 18, now)).toBe('stale');
	});

	it('reports an offline thermostat before anything else', () => {
		const offline = room({
			devices: [{ id: 'trv', kind: 'trv', name: 'Hlavice', online: false, lastSeenAt: at(5, 12) }],
			latest: { at: now - 47 * MINUTE_MS, temperature: 19.6, humidity: null }
		});
		expect(roomStatus(offline, 20, now)).toBe('offline');
	});
});

describe('homeAlerts', () => {
	it('orders offline, then open windows, then stale measurements', () => {
		const rooms = [
			room({ id: 'hall', latest: { at: now - 47 * MINUTE_MS, temperature: 18, humidity: 49 } }),
			room({ id: 'bath', window: { state: 'open', since: at(6, 58) } }),
			room({ id: 'ok' }),
			room({
				id: 'toilet',
				devices: [
					{ id: 'trv', kind: 'trv', name: 'Hlavice', online: false, lastSeenAt: at(5, 12) }
				],
				latest: null
			})
		];

		expect(homeAlerts(rooms, now)).toEqual([
			{ kind: 'offline', roomId: 'toilet', since: at(5, 12) },
			{ kind: 'window-open', roomId: 'bath', since: at(6, 58) },
			{ kind: 'stale', roomId: 'hall', since: now - 47 * MINUTE_MS }
		]);
	});
});
