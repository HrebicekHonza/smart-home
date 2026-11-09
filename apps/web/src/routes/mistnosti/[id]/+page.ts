import { error } from '@sveltejs/kit';
import { knownRoomIds } from '#lib/app/create-home.ts';
import { simulatorOnly } from '#lib/app/edition.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () =>
	simulatorOnly ? [] : knownRoomIds.map((id) => ({ id }));

export const load: PageLoad = ({ params }) => {
	if (!knownRoomIds.includes(params.id)) error(404, 'Místnost neexistuje');
	return { roomId: params.id };
};
