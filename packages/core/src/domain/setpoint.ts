import type { Celsius, EpochMillis } from './units.ts';

export interface SetpointLimits {
	readonly min: Celsius;
	readonly max: Celsius;
	readonly step: Celsius;
}

export const DEFAULT_SETPOINT_LIMITS: SetpointLimits = { min: 5, max: 30, step: 0.5 };

export type SetpointRequest =
	| { readonly status: 'pending'; readonly value: Celsius; readonly requestedAt: EpochMillis }
	| {
			readonly status: 'failed';
			readonly value: Celsius;
			readonly requestedAt: EpochMillis;
			readonly reason: string;
	  };

export interface Setpoint {
	readonly confirmed: Celsius;
	readonly confirmedAt: EpochMillis;
	readonly request?: SetpointRequest;
}

export type SetpointViolation = 'below-min' | 'above-max' | 'off-step';

export type SetpointValidation =
	{ readonly valid: true } | { readonly valid: false; readonly violation: SetpointViolation };

export function validateSetpoint(
	value: Celsius,
	limits: SetpointLimits = DEFAULT_SETPOINT_LIMITS
): SetpointValidation {
	if (value < limits.min) return { valid: false, violation: 'below-min' };
	if (value > limits.max) return { valid: false, violation: 'above-max' };
	if (!isOnStep(value, limits)) return { valid: false, violation: 'off-step' };
	return { valid: true };
}

export function stepSetpoint(
	current: Celsius,
	direction: 1 | -1,
	limits: SetpointLimits = DEFAULT_SETPOINT_LIMITS
): Celsius {
	const steps = (current - limits.min) / limits.step;
	const nextStep =
		direction === 1 ? Math.floor(steps + STEP_EPSILON) + 1 : Math.ceil(steps - STEP_EPSILON) - 1;
	const next = roundToStepPrecision(limits.min + nextStep * limits.step, limits);
	return Math.min(limits.max, Math.max(limits.min, next));
}

const STEP_EPSILON = 1e-9;

function isOnStep(value: Celsius, limits: SetpointLimits): boolean {
	const steps = (value - limits.min) / limits.step;
	return Math.abs(steps - Math.round(steps)) < STEP_EPSILON;
}

function roundToStepPrecision(value: Celsius, limits: SetpointLimits): Celsius {
	const decimals = (limits.step.toString().split('.')[1] ?? '').length;
	return Number(value.toFixed(decimals));
}
