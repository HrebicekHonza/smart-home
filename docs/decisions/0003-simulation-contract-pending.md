# 0003 Simulation contract pending

- **Status:** open
- **Date:** 2026-11-08

## Context

The simulation core (room thermal model, on/off control with hysteresis, PI control with anti-windup, outdoor temperature and open window, time series, energy and comfort metrics) is delivered by another agent. The original contract text was damaged and incomplete.

## Decision

Until an authoritative TypeScript contract is supplied or a corrected draft is confirmed:

- No simulation code and no `packages/simulation` package exist.
- The Simulator page states that the simulation core is not connected and shows no results.
- No mock data is presented as simulation output.

## Questions the contract must answer

1. Controller construction: parameters, where `Pmax` is configured, and whether output is clamped to `[0, Pmax]`.
2. Time sampling: fixed step `dt` in seconds, who owns the clock, and whether controllers receive `dt` per step.
3. Initial state: initial room temperature, controller state and outdoor conditions.
4. Controller reset: when it happens (setpoint change, window open) and what is reset (integrator, hysteresis state).
5. Comfort band: definition relative to the setpoint, symmetric or not, inclusive bounds.
6. Overshoot: absolute °C above setpoint or relative; measured after the first crossing or over the whole run.
7. Settling time: tolerance band and the condition for "settled" (stays inside until the end of the run?).
8. Energy metric: integral of power over time in J, or reported in kWh.
9. Open window model: change of thermal resistance, additional loss term, or something else.

Units are fixed: s, °C, W, J/K, K/W.
