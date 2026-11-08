export interface RoomParams {
	readonly C: number;
	readonly R: number;
	readonly Rwindow: number;
	readonly Pmax: number;
	readonly T0: number;
	readonly tauHeater?: number;
}

export interface Disturbances {
	outdoorTemp(t: number): number;
	windowOpen(t: number): boolean;
}

export interface ControllerInput {
	readonly t: number;
	readonly y: number;
	readonly w: number;
	readonly dt: number;
}

export interface Controller {
	readonly name: string;
	reset(): void;
	step(input: ControllerInput): number;
}

export interface SimOptions {
	readonly dt: number;
	readonly duration: number;
	setpoint(t: number): number;
}

export interface SimResult {
	readonly t: number[];
	readonly y: number[];
	readonly u: number[];
	readonly w: number[];
	readonly outdoor: number[];
	readonly window: boolean[];
	readonly heat: number[];
}

export interface Metrics {
	readonly energyKWh: number;
	readonly minutesOutsideBand: number;
	readonly minutesBelowBand: number;
	readonly overshoot: number;
	readonly settlingTime: number | null;
	readonly switches: number;
	readonly meanAbsError: number;
}
