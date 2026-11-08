import type { EffectiveTarget, EpochMillis, HomeMode, OverrideDuration } from '@doma/core';
import { formatTime } from '#lib/format/format.ts';
import { modeLabel } from './mode.ts';

export const OVERRIDE_DURATIONS: readonly { value: OverrideDuration; label: string }[] = [
	{ value: '1h', label: '1 hodina' },
	{ value: '2h', label: '2 hodiny' },
	{ value: 'next-change', label: 'Do změny rozvrhu' },
	{ value: 'permanent', label: 'Trvale' }
];

const SOURCE_LABEL: Record<EffectiveTarget['source'], string> = {
	manual: 'ruční změna',
	schedule: 'rozvrh',
	'mode-away': `režim ${modeLabel('away')}`,
	'mode-night': `režim ${modeLabel('night')}`
};

export function targetSourceLabel(target: EffectiveTarget): string {
	return SOURCE_LABEL[target.source];
}

export function targetValidityLabel(target: EffectiveTarget): string {
	if (target.validUntil === 'permanent') return 'trvale';
	if (target.validUntil === 'mode-change') return 'do změny režimu';
	return `do ${formatTime(target.validUntil)}`;
}

export function overrideExplanation(until: EpochMillis | null, mode: HomeMode): string {
	if (until === null) return 'Rozvrh se v místnosti neuplatní, dokud změnu nezrušíte.';
	return `Platí do ${formatTime(until)}, pak ${mode === 'home' ? 'podle rozvrhu' : 'podle režimu'}.`;
}
