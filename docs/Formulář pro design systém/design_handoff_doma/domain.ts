// Návrh doménových typů pro balíček @doma/domain (čistý TypeScript, bez UI závislostí).
// Odpovídá demo datům a stavům v prototypu.

export type Celsius = number;          // vždy krok 0,5 pro cíle; měření s 1 des. místem
export type HourOfDay = number;        // 0–24, desetinné (8.4 = 08:24)
export type Scope = { kind: 'home' } | { kind: 'room'; roomId: string } | { kind: 'device'; deviceId: string };

export type HomeMode = 'home' | 'away' | 'night';           // Doma / Pryč / Noc
export type ConnectionState = 'online' | 'loading' | 'offline';

export type WindowState = 'open' | 'closed' | 'unknown';    // unknown = bez senzoru
export type ScheduleSegment = { from: HourOfDay; to: HourOfDay; target: Celsius };

export type DeviceKind = 'trv' | 'climate-sensor' | 'window-contact' | 'light' | 'boiler';
export interface Device {
  id: string;                 // např. trv-obyvak-01 (zobrazuje se v Geist Mono)
  kind: DeviceKind;
  name: string;
  roomId: string | null;
  lastSeen: Date | null;
  battery?: number;           // %
  valve?: number;             // % otevření (trv)
  on?: boolean;               // light
}

export interface Measurement { at: Date; temperature: Celsius | null; humidity: number | null }

export interface ManualOverride {
  target: Celsius;
  until: Date | 'next-schedule-change' | 'permanent';
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  favorite: boolean;
  photoUrl?: string;
  schedule: ScheduleSegment[];          // pokrývá 0–24 bez mezer
  devices: Device[];
  latest: Measurement | null;
  window: WindowState;
  windowOpenedAt?: Date;
  override?: ManualOverride;
}

// Odkud plyne aktuální požadovaná teplota – zobrazovat vždy uživateli.
export type TargetSource = 'schedule' | 'mode-away' | 'mode-night' | 'manual';
export interface EffectiveTarget { target: Celsius; source: TargetSource; validUntil: Date | 'mode-change' | 'permanent' }

// Priorita: manual > režim (away = 17,0 °C; night = noční hodnota z rozvrhu) > rozvrh
export type RoomStatus =
  | 'heating'    // Topí: měření < cíl − 0,2
  | 'ok'         // V cíli
  | 'above'      // Nad cílem: měření > cíl + 0,5
  | 'paused'     // Pozastaveno: otevřené okno
  | 'stale'      // Zastaralé: poslední měření > 30 min
  | 'offline';   // Odpojeno: hlavice neodpovídá

export type CommandState =
  | { kind: 'idle' }
  | { kind: 'pending'; startedAt: Date }
  | { kind: 'confirmed'; at: Date }
  | { kind: 'failed'; reason: 'timeout' | 'device-offline' | 'partial'; message: string };

export interface HomeEvent {
  id: string;
  at: Date;
  scope: Scope;
  kind: 'schedule' | 'manual' | 'mode' | 'window' | 'device-offline' | 'fuel' | 'light';
  title: string;   // „Koupelna · okno otevřeno“
  detail: string;  // „Topení v místnosti pozastaveno“
}

export interface Boiler {
  model: string;               // Moceko Pro 25
  controller: string;          // IRYD 620
  waterTemp: Celsius | null;   // naměřená
  waterSetpoint: Celsius;      // 70
  waterMax: Celsius;           // 85
  fuel: string;                // Ořech 2
  nominalPowerKw: [number, number]; // [7.5, 25]
  lastRefuel?: Date;           // zapisováno ručně
}
