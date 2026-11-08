import type { DomainEvent } from '../domain/events.ts';
import type { RoomId, RoomState } from '../domain/room.ts';
import type { Celsius } from '../domain/units.ts';

export type GatewayKind = 'demo' | 'live';

export interface HomeSnapshot {
	readonly rooms: readonly RoomState[];
}

export interface SetTargetTemperatureCommand {
	readonly type: 'set-target-temperature';
	readonly roomId: RoomId;
	readonly value: Celsius;
}

export type HomeCommand = SetTargetTemperatureCommand;

export type CommandResult =
	{ readonly status: 'accepted' } | { readonly status: 'rejected'; readonly reason: string };

export type Unsubscribe = () => void;

export interface HomeGateway {
	readonly kind: GatewayKind;
	getSnapshot(): Promise<HomeSnapshot>;
	subscribe(listener: (event: DomainEvent) => void): Unsubscribe;
	send(command: HomeCommand): Promise<CommandResult>;
}
