import { error } from '@sveltejs/kit';
import { projects } from '$lib/projects';
import type { PageLoad, EntryGenerator } from './$types';
export const entries: EntryGenerator = () => projects.map((project) => ({ slug: project.slug }));
export const load: PageLoad = ({ params }) => {
	const index = projects.findIndex((p) => p.slug === params.slug);
	if (index < 0) error(404, 'Project not found');
	return { project: projects[index], next: projects[(index + 1) % projects.length] };
};
