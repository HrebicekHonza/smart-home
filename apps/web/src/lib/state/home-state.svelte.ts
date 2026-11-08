import {
	DEFAULT_OVERRIDE_DURATION,
	effectiveTarget,
	homeAlerts,
	offlineThermostats,
	roomStatus,
	stepSetpoint,
	type Celsius,
	type Clock,
	type CommandFailure,
	type DeviceId,
	type EffectiveTarget,
	type EpochMillis,
	type HistoryRange,
	type HomeGateway,
	type HomeMode,
	type HomeSnapshot,
	type OverrideDuration,
	type Room,
	type RoomAlert,
	type RoomId,
	type RoomStatus
} from '@doma/core';
import { messages } from '#lib/presentation/messages.ts';

export type CommandState =
	| { readonly status: 'idle' }
	| { readonly status: 'pending' }
	| { readonly status: 'confirmed'; readonly target: Celsius }
	| { readonly status: 'failed'; readonly reason: CommandFailure };

export interface Toast {
	readonly id: number;
	readonly message: string;
}

const IDLE: CommandState = { status: 'idle' };
const TOAST_DURATION_MS = 3200;
const CLOCK_TICK_MS = 15_000;

export class HomeState {
	snapshot = $state.raw<HomeSnapshot | null>(null);
	now = $state<EpochMillis>(0);
	drafts = $state<Record<RoomId, Celsius>>({});
	overrideDuration = $state<OverrideDuration>(DEFAULT_OVERRIDE_DURATION);
	targetCommands = $state<Record<RoomId, CommandState>>({});
	pendingMode = $state<HomeMode | null>(null);
	pendingLights = $state<Record<DeviceId, boolean>>({});
	toast = $state<Toast | null>(null);
	lastRoomId = $state<RoomId | null>(null);

	readonly #gateway: HomeGateway;
	readonly #clock: Clock;
	#toastTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(gateway: HomeGateway, clock: Clock) {
		this.#gateway = gateway;
		this.#clock = clock;
		this.now = clock.now();
	}

	get isDemo(): boolean {
		return this.#gateway.kind === 'demo';
	}

	get loading(): boolean {
		return this.snapshot === null;
	}

	get online(): boolean {
		return this.snapshot?.connection.status === 'online';
	}

	get mode(): HomeMode {
		return this.snapshot?.mode ?? 'home';
	}

	get rooms(): readonly Room[] {
		return this.snapshot?.rooms ?? [];
	}

	get alerts(): readonly RoomAlert[] {
		return homeAlerts(this.rooms, this.now);
	}

	get hasActiveOverride(): boolean {
		return this.rooms.some((room) => this.target(room).source === 'manual');
	}

	start(): () => void {
		const unsubscribe = this.#gateway.subscribe((snapshot) => (this.snapshot = snapshot));
		void this.#gateway.snapshot().then((snapshot) => (this.snapshot = snapshot));
		const ticker = setInterval(() => (this.now = this.#clock.now()), CLOCK_TICK_MS);
		return () => {
			unsubscribe();
			clearInterval(ticker);
			clearTimeout(this.#toastTimer);
		};
	}

	room(roomId: RoomId): Room | undefined {
		return this.rooms.find((room) => room.id === roomId);
	}

	target(room: Room): EffectiveTarget {
		return effectiveTarget(room, this.mode, this.now);
	}

	status(room: Room): RoomStatus {
		return roomStatus(room, this.target(room).target, this.now);
	}

	alertFor(room: Room): RoomAlert | undefined {
		return this.alerts.find((alert) => alert.roomId === room.id);
	}

	canControl(room: Room): boolean {
		return this.online && offlineThermostats(room).length === 0;
	}

	draft(room: Room): Celsius {
		return this.drafts[room.id] ?? this.target(room).target;
	}

	targetCommand(roomId: RoomId): CommandState {
		return this.targetCommands[roomId] ?? IDLE;
	}

	adjustDraft(room: Room, direction: 1 | -1) {
		this.drafts[room.id] = stepSetpoint(this.draft(room), direction);
		if (this.targetCommand(room.id).status !== 'pending') this.targetCommands[room.id] = IDLE;
	}

	async submitTarget(room: Room) {
		const target = this.draft(room);
		const unchanged = target === this.target(room).target;
		if (!this.canControl(room) || unchanged || this.targetCommand(room.id).status === 'pending') {
			return;
		}

		this.targetCommands[room.id] = { status: 'pending' };
		const outcome = await this.#gateway.send({
			type: 'set-target',
			roomId: room.id,
			target,
			duration: this.overrideDuration
		});

		if (outcome.status === 'failed') {
			this.targetCommands[room.id] = { status: 'failed', reason: outcome.reason };
			return;
		}
		this.targetCommands[room.id] = { status: 'confirmed', target };
		this.drafts = without(this.drafts, room.id);
		this.notify(messages.targetSet(room.name, target));
	}

	async cancelOverride(room: Room) {
		if (!this.online) return;
		const outcome = await this.#gateway.send({ type: 'cancel-override', roomId: room.id });
		if (outcome.status === 'confirmed') {
			this.targetCommands[room.id] = IDLE;
			this.notify(messages.overrideCancelled(room.name, this.mode));
		} else {
			this.notify(messages.commandFailed);
		}
	}

	async setMode(mode: HomeMode) {
		if (!this.online || this.pendingMode !== null || mode === this.mode) return;
		this.pendingMode = mode;
		const outcome = await this.#gateway.send({ type: 'set-mode', mode });
		this.pendingMode = null;
		this.notify(
			outcome.status === 'confirmed' ? messages.modeChanged(mode) : messages.commandFailed
		);
	}

	async setLight(room: Room, deviceId: DeviceId, on: boolean) {
		const device = room.devices.find((candidate) => candidate.id === deviceId);
		if (!this.online || !device || deviceId in this.pendingLights) return;
		this.pendingLights[deviceId] = on;
		const outcome = await this.#gateway.send({ type: 'set-light', deviceId, on });
		this.pendingLights = without(this.pendingLights, deviceId);
		this.notify(
			outcome.status === 'confirmed'
				? messages.lightSwitched(room.name, device.name, on)
				: messages.commandFailed
		);
	}

	history(roomId: RoomId, range: HistoryRange) {
		return this.#gateway.history(roomId, range);
	}

	notify(message: string) {
		clearTimeout(this.#toastTimer);
		this.toast = { id: (this.toast?.id ?? 0) + 1, message };
		this.#toastTimer = setTimeout(() => (this.toast = null), TOAST_DURATION_MS);
	}
}

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
	return Object.fromEntries(Object.entries(record).filter(([candidate]) => candidate !== key));
}
