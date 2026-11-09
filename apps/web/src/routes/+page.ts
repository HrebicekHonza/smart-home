import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { simulatorOnly } from '#lib/app/edition.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	if (simulatorOnly) redirect(307, resolve('/simulator'));
};
