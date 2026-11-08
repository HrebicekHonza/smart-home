# @doma/simulation – contract

Room heating simulation core taken over from the KKY/AKS semester paper. Behaviour is identical to the code that produced the paper's numbers; golden tests guard it.

Units: time s, temperature °C, power W, heat capacity J/K, thermal resistance K/W, energy reported in kWh.

## Model

```
C·dT/dt = Q − (T − Tout)/R − open(t)·(T − Tout)/Rwindow
τheater·dQ/dt = u − Q          (Q = u when tauHeater is 0 or missing)
```

`u` is the power requested by the controller, `Q` (`heat`) the power the radiator actually delivers.

## API

| Export                                                                          | Purpose                                                    |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `simulate(room, controller, disturbances, { dt, duration, setpoint })`          | Explicit Euler with fixed step; returns `SimResult` series |
| `metrics(result, { band })`                                                     | Energy and comfort metrics                                 |
| `OnOffHysteresis(power, hysteresis, startOn = false)`                           | Room thermostat                                            |
| `PIController(K, Ti, uMin, uMax, antiWindup = true)`                            | PI with conditional-integration anti-windup                |
| `ProportionalValve(power, band = 2)`                                            | Thermostatic radiator valve as a P controller              |
| `ConstantPower(power)`                                                          | Open loop, used for identification                         |
| `identifyStep(room, deltaP, Tout, dt = 10)`, `zieglerNicholsPI(id)`             | Inflection-tangent identification and Z–N PI tuning        |
| `sinusoidalOutdoor`, `windowSchedule`, `setpointSchedule`, `disturbances`       | Scenario helpers (hours from the start of the run)         |
| `studyRoom`                                                                     | Reference room of the paper with its derivation            |
| `REFERENCE_*`, `referenceSetpoint`, `referenceDisturbances`, `createController` | Reference scenario of the paper                            |

## Answers to the open contract questions

1. **Controller construction.** Power limits are constructor arguments; PI output is clamped to `[uMin, uMax]`; `simulate()` additionally clamps every output to `[0, room.Pmax]`. PI tuning: `zieglerNicholsPI(identifyStep(room, room.Pmax, 0))`.
2. **Sampling.** Fixed `dt`, explicit Euler. `simulate()` owns the clock (`t = k·dt`, `k = 0…round(duration/dt)`) and calls the controller once per step with `dt`. Reference `dt = 30 s`.
3. **Initial state.** Room at `room.T0`, radiator power `Q = 0`, controller after `reset()`; disturbances evaluated from `t = 0`.
4. **Reset.** Only at the start of `simulate()`. Setpoint changes and window opening reset nothing.
5. **Comfort band.** Symmetric `±band` (reference 0.5 K). Outside: `|y − w| > band`; below: `y − w < −band`.
6. **Overshoot.** `max(y − w)` in K over the run, excluding samples after a setpoint decrease until the next setpoint change; 0 if never above.
7. **Settling time.** Seconds from the start until `y` enters `w0 ± band` and stays there until the first setpoint change (or the end); `null` otherwise.
8. **Energy.** Rectangle-rule integral of delivered power `heat`, in kWh.
9. **Open window.** Extra parallel loss path through `Rwindow`.

`switches` counts 0 → >0 transitions of `u` (plus one if it starts on); `meanAbsError` is the time average of `|y − w|`.

## Golden values

`test/golden.json` holds the metrics cited by the paper. After the paper's inputs change, regenerate it from the paper's results file:

```
pnpm --filter @doma/simulation golden:update "<path>/podklady/data/vysledky.json"
```
