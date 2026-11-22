import { error } from '@sveltejs/kit';
import { summaries, previewDrafts } from '$lib/server/posts';

export const prerender = previewDrafts;
export const load = () => {
	if (!previewDrafts) error(404, 'Page not found');
	return { posts: summaries, previewDrafts };
};
