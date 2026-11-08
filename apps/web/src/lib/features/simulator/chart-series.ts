export interface ChartSeries {
	readonly id: string;
	readonly label: string;
	readonly values: readonly number[];
	readonly stroke: string;
	readonly swatch: string;
	readonly dashed?: boolean;
}
