import type { DeviceId, HomeMode, RoomId } from './home.ts';
import type { Celsius, EpochMillis } from './units.ts';

interface EventBase {
	readonly id: string;
	readonly at: EpochMillis;
}

export type HomeEvent = EventBase &
	(
		| { readonly kind: 'mode-changed'; readonly mode: HomeMode }
		| {
				readonly kind: 'override-set';
				readonly roomId: RoomId;
				readonly target: Celsius;
				readonly until: EpochMillis | null;
		  }
		| { readonly kind: 'override-cancelled'; readonly roomId: RoomId }
		| { readonly kind: 'window-opened'; readonly roomId: RoomId }
		| { readonly kind: 'window-closed'; readonly roomId: RoomId }
		| { readonly kind: 'device-offline'; readonly roomId: RoomId; readonly deviceId: DeviceId }
		| {
				readonly kind: 'schedule-applied';
				readonly period: 'day' | 'night';
				readonly roomCount: number;
		  }
		| { readonly kind: 'fuel-refilled' }
		| {
				readonly kind: 'light-switched';
				readonly roomId: RoomId;
				readonly deviceId: DeviceId;
				readonly on: boolean;
		  }
	);

export type HomeEventKind = HomeEvent['kind'];

export function eventRoomId(event: HomeEvent): RoomId | null {
	return 'roomId' in event ? event.roomId : null;
}
