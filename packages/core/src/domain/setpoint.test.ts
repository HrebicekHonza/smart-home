import { describe, expect, it } from 'vitest';
import { stepSetpoint, validateSetpoint, type SetpointLimits } from './setpoint.ts';

const limits: SetpointLimits = { min: 16, max: 26, step: 0.5 };

describe('validateSetpoint', () => {
	it.each([16, 21.5, 26])('accepts %s °C within limits on a step', (value) => {
		expect(validateSetpoint(value, limits)).toEqual({ valid: true });
	});

	it.each([
		[15.5, 'below-min'],
		[26.5, 'above-max'],
		[21.3, 'off-step']
	] as const)('rejects %s °C as %s', (value, violation) => {
		expect(validateSetpoint(value, limits)).toEqual({ valid: false, violation });
	});

	it('tolerates floating point noise on step boundaries', () => {
		expect(validateSetpoint(0.1 + 0.2 + 20.7, { min: 0, max: 30, step: 0.1 })).toEqual({
			valid: true
		});
	});
});

describe('stepSetpoint', () => {
	it('moves one step up and down', () => {
		expect(stepSetpoint(21, 1, limits)).toBe(21.5);
		expect(stepSetpoint(21, -1, limits)).toBe(20.5);
	});

	it('snaps an off-step value to the neighbouring step in the requested direction', () => {
		expect(stepSetpoint(21.3, 1, limits)).toBe(21.5);
		expect(stepSetpoint(21.3, -1, limits)).toBe(21);
	});

	it('never leaves the allowed range', () => {
		expect(stepSetpoint(26, 1, limits)).toBe(26);
		expect(stepSetpoint(16, -1, limits)).toBe(16);
		expect(stepSetpoint(40, -1, limits)).toBe(26);
	});

	it('keeps decimal precision of the step', () => {
		expect(stepSetpoint(20.1, 1, { min: 0, max: 30, step: 0.1 })).toBe(20.2);
	});
});
