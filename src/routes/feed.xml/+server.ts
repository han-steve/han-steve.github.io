import { error } from '@sveltejs/kit';
import { published, previewDrafts } from '$lib/server/posts';
import { xml } from '$lib/server/markdown';
export const prerender = previewDrafts;
export const GET = () => {
	if (!previewDrafts) error(404, 'Page not found');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Steve Han — The notebook</title><link>https://hansteve.com/blog/</link><description>Notes on systems, software, and building things.</description><language>en-us</language>${published.map((post) => `<item><title>${xml(post.title)}</title><link>https://hansteve.com/blog/${post.slug}/</link><guid>https://hansteve.com/blog/${post.slug}/</guid><pubDate>${new Date(post.date).toUTCString()}</pubDate><description>${xml(post.description)}</description></item>`).join('')}</channel></rss>`,
		{ headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
	);
};
