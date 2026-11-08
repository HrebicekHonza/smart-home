import type { ControllerKind } from '@doma/simulation';

export interface ControllerPresentation {
	readonly label: string;
	readonly stroke: string;
	readonly swatch: string;
}

export const CONTROLLERS: Record<ControllerKind, ControllerPresentation> = {
	valve: {
		label: 'Termostatická hlavice (P)',
		stroke: 'stroke-series-1',
		swatch: 'bg-series-1'
	},
	thermostat: {
		label: 'Termostat s hysterezí',
		stroke: 'stroke-series-2',
		swatch: 'bg-series-2'
	},
	pi: {
		label: 'PI s anti-windupem',
		stroke: 'stroke-series-3',
		swatch: 'bg-series-3'
	},
	piWithoutAntiWindup: {
		label: 'PI bez anti-windupu',
		stroke: 'stroke-series-4',
		swatch: 'bg-series-4'
	}
};
