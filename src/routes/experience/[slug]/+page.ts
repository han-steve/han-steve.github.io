import { error } from '@sveltejs/kit';
import { experience } from '$lib/experience';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => experience.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const job = experience.find(({ slug }) => slug === params.slug);
	if (!job) error(404, 'Experience not found');
	return { job };
};
