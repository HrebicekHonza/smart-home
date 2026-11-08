import { effectiveTarget, homeAlerts, type HomeSnapshot } from '@doma/core';
import { describe, expect, it } from 'vitest';
import { DemoGateway, type DemoGatewayOptions } from './demo-gateway.ts';

const now = new Date(2026, 10, 8, 8, 24).getTime();
const clock = { now: () => now };
const instant = () => Promise.resolve();

function gateway(options: Partial<DemoGatewayOptions> = {}) {
	return new DemoGateway({ clock, delay: instant, ...options });
}

function target(snapshot: HomeSnapshot, roomId: string) {
	const room = snapshot.rooms.find((candidate) => candidate.id === roomId);
	if (!room) throw new Error(`Missing room ${roomId}`);
	return effectiveTarget(room, snapshot.mode, now);
}

describe('DemoGateway', () => {
	it('identifies itself as demo data', () => {
		expect(gateway().kind).toBe('demo');
	});

	it('starts with one offline, one open-window and one stale room', async () => {
		const snapshot = await gateway().snapshot();
		expect(homeAlerts(snapshot.rooms, now).map((alert) => [alert.kind, alert.roomId])).toEqual([
			['offline', 'toaleta'],
			['window-open', 'koupelna'],
			['stale', 'chodba']
		]);
	});

	it('rejects the first target change in a room and keeps the original target', async () => {
		const demo = gateway();
		const before = target(await demo.snapshot(), 'obyvak');

		const outcome = await demo.send({
			type: 'set-target',
			roomId: 'obyvak',
			target: 22.5,
			duration: '2h'
		});

		expect(outcome).toEqual({ status: 'failed', reason: 'partial' });
		expect(target(await demo.snapshot(), 'obyvak')).toEqual(before);
	});

	it('confirms a retried target change, applies the override and records an event', async () => {
		const demo = gateway({ failFirstTargetChange: false });
		const updates: HomeSnapshot[] = [];
		demo.subscribe((snapshot) => updates.push(snapshot));

		const outcome = await demo.send({
			type: 'set-target',
			roomId: 'obyvak',
			target: 22.5,
			duration: '1h'
		});

		const snapshot = await demo.snapshot();
		expect(outcome).toEqual({ status: 'confirmed' });
		expect(target(snapshot, 'obyvak')).toEqual({
			target: 22.5,
			source: 'manual',
			validUntil: now + 60 * 60_000
		});
		expect(snapshot.events[0]).toMatchObject({ kind: 'override-set', roomId: 'obyvak' });
		expect(updates.at(-1)).toBe(snapshot);
	});

	it('cannot change the target in a room with an offline thermostat', async () => {
		const outcome = await gateway({ failFirstTargetChange: false }).send({
			type: 'set-target',
			roomId: 'toaleta',
			target: 21,
			duration: '2h'
		});
		expect(outcome).toEqual({ status: 'failed', reason: 'device-offline' });
	});

	it('switches the home mode for every room without an override', async () => {
		const demo = gateway();
		await demo.send({ type: 'set-mode', mode: 'away' });

		const snapshot = await demo.snapshot();
		expect(target(snapshot, 'kuchyne')).toMatchObject({ target: 17, source: 'mode-away' });
		expect(snapshot.events[0]).toMatchObject({ kind: 'mode-changed', mode: 'away' });
	});

	it('rejects every command while the home server is unreachable', async () => {
		const demo = gateway({ scenario: 'offline' });
		expect((await demo.snapshot()).connection.status).toBe('offline');
		expect(await demo.send({ type: 'set-mode', mode: 'night' })).toEqual({
			status: 'failed',
			reason: 'offline'
		});
	});

	it('produces history that ends at the latest measurement and has a gap while offline', async () => {
		const demo = gateway();
		const living = await demo.history('obyvak', '24h');
		const toilet = await demo.history('toaleta', '24h');
		const snapshot = await demo.snapshot();

		expect(living).toHaveLength(97);
		expect(living.at(-1)?.measured).toBe(
			snapshot.rooms.find((room) => room.id === 'obyvak')?.latest?.temperature
		);
		expect(toilet.at(-1)?.measured).toBeNull();
		expect(toilet[0]?.measured).not.toBeNull();
	});
});
