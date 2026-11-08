import {
	CONTROLLER_KINDS,
	REFERENCE_BAND,
	REFERENCE_DT,
	REFERENCE_DURATION,
	REFERENCE_HYSTERESIS,
	REFERENCE_VALVE_BAND,
	REFERENCE_WEATHER,
	createController,
	disturbances,
	identifyStep,
	metrics,
	setpointSchedule,
	simulate,
	sinusoidalOutdoor,
	studyRoom,
	windowSchedule,
	zieglerNicholsPI,
	type ControllerKind,
	type Metrics,
	type ReferenceWeather,
	type RoomParams,
	type SimResult
} from '@doma/simulation';

export type WeatherChoice = ReferenceWeather | 'custom';

export interface SimulationRun {
	readonly kind: ControllerKind;
	readonly result: SimResult;
	readonly metrics: Metrics;
}

export type Tuning =
	| { readonly status: 'ok'; readonly K: number; readonly Ti: number }
	| { readonly status: 'unavailable' };

const DAY_STARTS_AT_HOUR = 6;
const NIGHT_STARTS_AT_HOUR = 22;

interface RoomInput {
	C: number;
	R: number;
	Rwindow: number;
	Pmax: number;
	T0: number;
	tauHeater: number;
}

const referenceRoom = (): RoomInput => ({ tauHeater: 0, ...studyRoom.room });

export class SimulatorState {
	room = $state<RoomInput>(referenceRoom());
	enabled = $state<Record<ControllerKind, boolean>>(allControllers());
	valveBand = $state(REFERENCE_VALVE_BAND);
	hysteresis = $state(REFERENCE_HYSTERESIS);
	autoTuning = $state(true);
	manualK = $state(0);
	manualTi = $state(0);
	weather = $state<WeatherChoice>('base');
	customMean = $state<number>(REFERENCE_WEATHER.base.mean);
	customAmplitude = $state<number>(REFERENCE_WEATHER.base.amplitude);
	windowOpen = $state(true);
	windowFromHour = $state(7);
	windowMinutes = $state(10);
	setback = $state(true);
	daySetpoint = $state(21);
	nightSetpoint = $state(18);
	hoverIndex = $state<number | null>(null);

	readonly band = REFERENCE_BAND;
	readonly dt = REFERENCE_DT;
	readonly duration = REFERENCE_DURATION;

	readonly params: RoomParams | null = $derived.by(() => {
		const { C, R, Rwindow, Pmax, T0, tauHeater } = this.room;
		const positive = [C, R, Rwindow, Pmax].every((value) => Number.isFinite(value) && value > 0);
		if (!positive || !Number.isFinite(T0) || !Number.isFinite(tauHeater) || tauHeater < 0) {
			return null;
		}
		return { C, R, Rwindow, Pmax, T0, tauHeater };
	});

	readonly derivedTuning: Tuning = $derived.by(() => {
		if (!this.params) return { status: 'unavailable' };
		try {
			const tuning = zieglerNicholsPI(identifyStep(this.params, this.params.Pmax, 0, 10));
			return { status: 'ok', ...tuning };
		} catch {
			return { status: 'unavailable' };
		}
	});

	readonly tuning: Tuning = $derived(
		this.autoTuning
			? this.derivedTuning
			: this.manualK > 0 && this.manualTi > 0
				? { status: 'ok', K: this.manualK, Ti: this.manualTi }
				: { status: 'unavailable' }
	);

	readonly windowIntervals: readonly (readonly [number, number])[] = $derived(
		this.windowOpen && this.windowMinutes > 0
			? [[this.windowFromHour, this.windowFromHour + this.windowMinutes / 60]]
			: []
	);

	readonly runs: readonly SimulationRun[] = $derived.by(() => {
		const params = this.params;
		if (!params) return [];
		const tuning = this.tuning;
		const settings = {
			valveBand: this.valveBand,
			hysteresis: this.hysteresis,
			K: tuning.status === 'ok' ? tuning.K : Number.NaN,
			Ti: tuning.status === 'ok' ? tuning.Ti : Number.NaN
		};
		const setpoint = this.setback
			? setpointSchedule([
					{ from: 0, value: this.nightSetpoint },
					{ from: DAY_STARTS_AT_HOUR, value: this.daySetpoint },
					{ from: NIGHT_STARTS_AT_HOUR, value: this.nightSetpoint }
				])
			: setpointSchedule([{ from: 0, value: this.daySetpoint }]);
		const { mean, amplitude, minAtHour } =
			this.weather === 'custom'
				? { mean: this.customMean, amplitude: this.customAmplitude, minAtHour: 5 }
				: REFERENCE_WEATHER[this.weather];
		const dist = disturbances(
			sinusoidalOutdoor(mean, amplitude, minAtHour),
			windowSchedule(this.windowIntervals)
		);

		return CONTROLLER_KINDS.filter((kind) => this.enabled[kind])
			.filter((kind) => !isPi(kind) || tuning.status === 'ok')
			.map((kind) => {
				const result = simulate(params, createController(kind, params, settings), dist, {
					dt: this.dt,
					duration: this.duration,
					setpoint
				});
				return { kind, result, metrics: metrics(result, { band: this.band }) };
			});
	});

	readonly piUnavailable: boolean = $derived(
		this.tuning.status === 'unavailable' && (this.enabled.pi || this.enabled.piWithoutAntiWindup)
	);

	setAutoTuning(enabled: boolean) {
		if (!enabled && this.derivedTuning.status === 'ok') {
			this.manualK = this.derivedTuning.K;
			this.manualTi = this.derivedTuning.Ti;
		}
		this.autoTuning = enabled;
	}

	resetToReference() {
		this.room = referenceRoom();
		this.enabled = allControllers();
		this.valveBand = REFERENCE_VALVE_BAND;
		this.hysteresis = REFERENCE_HYSTERESIS;
		this.autoTuning = true;
		this.weather = 'base';
		this.windowOpen = true;
		this.windowFromHour = 7;
		this.windowMinutes = 10;
		this.setback = true;
		this.daySetpoint = 21;
		this.nightSetpoint = 18;
	}
}

function allControllers(): Record<ControllerKind, boolean> {
	return { valve: true, thermostat: true, pi: true, piWithoutAntiWindup: true };
}

function isPi(kind: ControllerKind): boolean {
	return kind === 'pi' || kind === 'piWithoutAntiWindup';
}
