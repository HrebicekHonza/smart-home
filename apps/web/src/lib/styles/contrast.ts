export function contrastRatio(foreground: string, background: string): number {
	const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
		(a, b) => b - a
	) as [number, number];
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
	const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
	if (!match) throw new Error(`Expected #rrggbb colour, got "${hex}"`);
	const [r, g, b] = match.slice(1).map((channel) => linearize(parseInt(channel, 16) / 255)) as [
		number,
		number,
		number
	];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function linearize(channel: number): number {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}
