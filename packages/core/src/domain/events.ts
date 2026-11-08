import type { HeatingStatus, RoomId } from './room.ts';
import type { Celsius, EpochMillis } from './units.ts';

interface EventBase {
	readonly id: string;
	readonly roomId: RoomId;
	readonly occurredAt: EpochMillis;
}

export type DomainEvent = EventBase &
	(
		| { readonly type: 'setpoint-requested'; readonly value: Celsius }
		| { readonly type: 'setpoint-confirmed'; readonly value: Celsius }
		| { readonly type: 'setpoint-failed'; readonly value: Celsius; readonly reason: string }
		| { readonly type: 'window-opened' }
		| { readonly type: 'window-closed' }
		| { readonly type: 'heating-changed'; readonly status: HeatingStatus }
	);

export type DomainEventType = DomainEvent['type'];
