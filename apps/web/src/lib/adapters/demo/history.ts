import {
	HOUR_MS,
	MINUTE_MS,
	localMinuteOfDay,
	offlineThermostats,
	segmentAt,
	type EpochMillis,
	type HistoryPoint,
	type HistoryRange,
	type Room
} from '@doma/core';

const RANGES: Record<HistoryRange, { readonly span: number; readonly step: number }> = {
	'24h': { span: 24 * HOUR_MS, step: 15 * MINUTE_MS },
	'7d': { span: 7 * 24 * HOUR_MS, step: HOUR_MS }
};

const RESPONSE_HOURS = 1.4;

export function demoHistory(
	room: Room,
	range: HistoryRange,
	now: EpochMillis
): readonly HistoryPoint[] {
	const { span, step } = RANGES[range];
	const steps = Math.round(span / step);
	const follow = 1 - Math.exp(-step / HOUR_MS / RESPONSE_HOURS);
	const seed =
		Array.from({ length: room.id.length }, (_, index) => room.id.charCodeAt(index)).reduce(
			(sum, code) => sum + code,
			0
		) % 17;
	const targetAt = (at: EpochMillis) => segmentAt(room.schedule, localMinuteOfDay(at)).target;

	let level = targetAt(now - span) - 0.4;
	const points = Array.from({ length: steps + 1 }, (_, index) => {
		const at = now - span + index * step;
		const target = targetAt(at);
		level += (target - level) * follow;
		const wobble = 0.14 * Math.sin(index * 0.8 + seed) + 0.09 * Math.sin(index * 0.21 + seed * 3);
		return { at, target, measured: level + wobble };
	});

	const last = points.at(-1)?.measured ?? 0;
	const drift = (room.latest?.temperature ?? last) - last;
	const gapFrom = offlineSince(room);

	return points.map((point, index) => ({
		at: point.at,
		target: point.target,
		measured:
			gapFrom !== null && point.at > gapFrom
				? null
				: Math.round((point.measured + (drift * index) / steps) * 10) / 10
	}));
}

function offlineSince(room: Room): EpochMillis | null {
	const seen = offlineThermostats(room)
		.map((device) => device.lastSeenAt)
		.filter((at) => at !== null);
	return seen.length > 0 ? Math.min(...seen) : null;
}
