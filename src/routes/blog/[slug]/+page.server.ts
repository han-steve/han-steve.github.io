import { error } from '@sveltejs/kit';
import { posts, previewDrafts } from '$lib/server/posts';
import type { EntryGenerator, PageServerLoad } from './$types';

// An empty published collection is valid; every existing post still has an explicit entry.
export const prerender = previewDrafts;
export const entries: EntryGenerator = () => posts.map((post) => ({ slug: post.slug }));
export const load: PageServerLoad = ({ params }) => {
	const post = posts.find((post) => post.slug === params.slug);
	if (!previewDrafts || !post) error(404, 'Note not found');
	return { post };
};
