import {
	MINUTE_MS,
	offlineThermostats,
	overrideUntil,
	type Clock,
	type CommandOutcome,
	type HistoryRange,
	type HomeCommand,
	type HomeEvent,
	type HomeGateway,
	type HomeSnapshot,
	type Room,
	type RoomId
} from '@doma/core';
import { demoHistory } from './history.ts';
import { seedDemoHome } from './seed.ts';

export type DemoScenario = 'normal' | 'offline' | 'loading';

export interface DemoGatewayOptions {
	readonly clock: Clock;
	readonly scenario?: DemoScenario;
	readonly failFirstTargetChange?: boolean;
	readonly delay?: (ms: number) => Promise<void>;
}

const LATENCY_MS = { 'set-mode': 600, 'set-target': 900, 'cancel-override': 400, 'set-light': 400 };

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class DemoGateway implements HomeGateway {
	readonly kind = 'demo';

	readonly #clock: Clock;
	readonly #scenario: DemoScenario;
	readonly #delay: (ms: number) => Promise<void>;
	readonly #listeners = new Set<(snapshot: HomeSnapshot) => void>();
	readonly #attemptedRooms = new Set<RoomId>();
	readonly #failFirstTargetChange: boolean;
	#state: HomeSnapshot;
	#eventSequence = 0;

	constructor(options: DemoGatewayOptions) {
		this.#clock = options.clock;
		this.#scenario = options.scenario ?? 'normal';
		this.#delay = options.delay ?? wait;
		this.#failFirstTargetChange = options.failFirstTargetChange ?? true;

		const seeded = seedDemoHome(this.#clock.now());
		this.#state =
			this.#scenario === 'offline'
				? {
						...seeded,
						connection: { status: 'offline', lastSyncAt: this.#clock.now() - 12 * MINUTE_MS }
					}
				: seeded;
	}

	snapshot(): Promise<HomeSnapshot> {
		if (this.#scenario === 'loading') return new Promise(() => undefined);
		return Promise.resolve(this.#state);
	}

	subscribe(listener: (snapshot: HomeSnapshot) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	async send(command: HomeCommand): Promise<CommandOutcome> {
		await this.#delay(LATENCY_MS[command.type]);
		if (this.#state.connection.status === 'offline') return failed('offline');

		switch (command.type) {
			case 'set-mode':
				this.#update({ mode: command.mode }, { kind: 'mode-changed', mode: command.mode });
				return confirmed;
			case 'set-target':
				return this.#setTarget(command);
			case 'cancel-override':
				this.#updateRoom(command.roomId, (room) => withoutOverride(room));
				this.#record({ kind: 'override-cancelled', roomId: command.roomId });
				return confirmed;
			case 'set-light':
				return this.#setLight(command.deviceId, command.on);
		}
	}

	history(roomId: RoomId, range: HistoryRange) {
		const room = this.#room(roomId);
		return Promise.resolve(room ? demoHistory(room, range, this.#clock.now()) : []);
	}

	#setTarget(command: Extract<HomeCommand, { type: 'set-target' }>): CommandOutcome {
		const room = this.#room(command.roomId);
		if (!room) return failed('timeout');
		if (offlineThermostats(room).length > 0) return failed('device-offline');
		if (this.#failFirstTargetChange && !this.#attemptedRooms.has(room.id)) {
			this.#attemptedRooms.add(room.id);
			return failed('partial');
		}

		const now = this.#clock.now();
		const until = overrideUntil(command.duration, now, room.schedule);
		this.#updateRoom(room.id, (current) => ({
			...current,
			override: { target: command.target, until, createdAt: now }
		}));
		this.#record({ kind: 'override-set', roomId: room.id, target: command.target, until });
		return confirmed;
	}

	#setLight(deviceId: string, on: boolean): CommandOutcome {
		const room = this.#state.rooms.find((candidate) =>
			candidate.devices.some((device) => device.id === deviceId)
		);
		if (!room) return failed('timeout');

		this.#updateRoom(room.id, (current) => ({
			...current,
			devices: current.devices.map((device) =>
				device.id === deviceId ? { ...device, on } : device
			)
		}));
		this.#record({ kind: 'light-switched', roomId: room.id, deviceId, on });
		return confirmed;
	}

	#room(roomId: RoomId): Room | undefined {
		return this.#state.rooms.find((room) => room.id === roomId);
	}

	#updateRoom(roomId: RoomId, change: (room: Room) => Room) {
		this.#update({
			rooms: this.#state.rooms.map((room) => (room.id === roomId ? change(room) : room))
		});
	}

	#record(event: DistributiveOmit<HomeEvent, 'id' | 'at'>) {
		this.#update({}, event);
	}

	#update(change: Partial<HomeSnapshot>, event?: DistributiveOmit<HomeEvent, 'id' | 'at'>) {
		const events = event
			? [
					{ ...event, id: `demo-${++this.#eventSequence}`, at: this.#clock.now() } as HomeEvent,
					...this.#state.events
				]
			: this.#state.events;
		this.#state = { ...this.#state, ...change, events };
		for (const listener of this.#listeners) listener(this.#state);
	}
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

const confirmed: CommandOutcome = { status: 'confirmed' };

function failed(reason: Extract<CommandOutcome, { status: 'failed' }>['reason']): CommandOutcome {
	return { status: 'failed', reason };
}

function withoutOverride(room: Room): Room {
	const { override, ...rest } = room;
	return rest;
}
