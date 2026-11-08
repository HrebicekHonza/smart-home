import type { HomeEvent } from '../domain/events.ts';
import type { Boiler, DeviceId, HomeMode, Room, RoomId } from '../domain/home.ts';
import type { OverrideDuration } from '../domain/override.ts';
import type { Celsius, EpochMillis } from '../domain/units.ts';

export type GatewayKind = 'demo' | 'live';

export type Connection =
	{ readonly status: 'online' } | { readonly status: 'offline'; readonly lastSyncAt: EpochMillis };

export interface HomeSnapshot {
	readonly connection: Connection;
	readonly mode: HomeMode;
	readonly rooms: readonly Room[];
	readonly boiler: Boiler;
	readonly events: readonly HomeEvent[];
}

export type HomeCommand =
	| { readonly type: 'set-mode'; readonly mode: HomeMode }
	| {
			readonly type: 'set-target';
			readonly roomId: RoomId;
			readonly target: Celsius;
			readonly duration: OverrideDuration;
	  }
	| { readonly type: 'cancel-override'; readonly roomId: RoomId }
	| { readonly type: 'set-light'; readonly deviceId: DeviceId; readonly on: boolean };

export type CommandFailure = 'timeout' | 'device-offline' | 'partial' | 'offline';

export type CommandOutcome =
	{ readonly status: 'confirmed' } | { readonly status: 'failed'; readonly reason: CommandFailure };

export type HistoryRange = '24h' | '7d';

export interface HistoryPoint {
	readonly at: EpochMillis;
	readonly measured: Celsius | null;
	readonly target: Celsius;
}

export type Unsubscribe = () => void;

export interface HomeGateway {
	readonly kind: GatewayKind;
	snapshot(): Promise<HomeSnapshot>;
	subscribe(listener: (snapshot: HomeSnapshot) => void): Unsubscribe;
	send(command: HomeCommand): Promise<CommandOutcome>;
	history(roomId: RoomId, range: HistoryRange): Promise<readonly HistoryPoint[]>;
}
