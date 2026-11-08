import { offlineThermostats, type Room, type RoomId } from './home.ts';
import { isStale } from './measurement.ts';
import type { Celsius, EpochMillis } from './units.ts';

export type RoomStatus = 'heating' | 'ok' | 'above' | 'paused' | 'stale' | 'offline';

export const HEATING_BELOW_TARGET: Celsius = 0.2;
export const ABOVE_TARGET: Celsius = 0.5;

export function roomStatus(room: Room, target: Celsius, now: EpochMillis): RoomStatus {
	if (offlineThermostats(room).length > 0 || room.latest?.temperature == null) return 'offline';
	if (isStale(room.latest, now)) return 'stale';
	if (room.window.state === 'open') return 'paused';

	const measured = room.latest.temperature;
	if (measured < target - HEATING_BELOW_TARGET) return 'heating';
	if (measured > target + ABOVE_TARGET) return 'above';
	return 'ok';
}

export type RoomAlert =
	| { readonly kind: 'offline'; readonly roomId: RoomId; readonly since: EpochMillis | null }
	| { readonly kind: 'window-open'; readonly roomId: RoomId; readonly since: EpochMillis }
	| { readonly kind: 'stale'; readonly roomId: RoomId; readonly since: EpochMillis };

const ALERT_ORDER: Record<RoomAlert['kind'], number> = { offline: 0, 'window-open': 1, stale: 2 };

export function roomAlert(room: Room, now: EpochMillis): RoomAlert | null {
	const offline = offlineThermostats(room);
	if (offline.length > 0 || room.latest?.temperature == null) {
		const lastSeen = offline.map((device) => device.lastSeenAt).filter((at) => at !== null);
		return {
			kind: 'offline',
			roomId: room.id,
			since: lastSeen.length > 0 ? Math.min(...lastSeen) : (room.latest?.at ?? null)
		};
	}
	if (isStale(room.latest, now)) return { kind: 'stale', roomId: room.id, since: room.latest.at };
	if (room.window.state === 'open') {
		return { kind: 'window-open', roomId: room.id, since: room.window.since };
	}
	return null;
}

export function homeAlerts(rooms: readonly Room[], now: EpochMillis): readonly RoomAlert[] {
	return rooms
		.map((room) => roomAlert(room, now))
		.filter((alert) => alert !== null)
		.sort((a, b) => ALERT_ORDER[a.kind] - ALERT_ORDER[b.kind]);
}
