export interface Scale {
	readonly min: number;
	readonly max: number;
	readonly ticks: readonly number[];
}

export function niceScale(values: readonly number[], tickCount = 4): Scale {
	const finite = values.filter(Number.isFinite);
	const low = finite.length > 0 ? Math.min(...finite) : 0;
	const high = finite.length > 0 ? Math.max(...finite) : 1;
	const span = high - low || Math.abs(high) || 1;
	const step = niceStep(span / (tickCount - 1));
	const min = Math.floor(low / step) * step;
	const max = Math.max(Math.ceil(high / step) * step, min + step);
	const ticks: number[] = [];
	for (let tick = min; tick <= max + step / 2; tick += step) ticks.push(roundTo(tick, step));
	return { min, max, ticks };
}

function niceStep(raw: number): number {
	const magnitude = 10 ** Math.floor(Math.log10(raw));
	const normalized = raw / magnitude;
	const nice =
		normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
	return nice * magnitude;
}

function roundTo(value: number, step: number): number {
	const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
	return Number(value.toFixed(decimals));
}

export function polylinePoints(
	times: readonly number[],
	values: readonly number[],
	duration: number,
	scale: Scale,
	width: number,
	height: number
): string {
	const span = scale.max - scale.min || 1;
	return values
		.map((value, index) => {
			const x = ((times[index] ?? 0) / duration) * width;
			const y = ((scale.max - value) / span) * height;
			return `${x.toFixed(1)},${y.toFixed(2)}`;
		})
		.join(' ');
}
