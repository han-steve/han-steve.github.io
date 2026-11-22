import { dev } from '$app/environment';
import { parsePost, type Post } from './markdown';
const documents = import.meta.glob('/src/content/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;
export const previewDrafts = dev || import.meta.env.VITE_INCLUDE_DRAFTS === 'true';
export const posts: Post[] = Object.entries(documents)
	.map(([path, source]) => parsePost(source, path.split('/').pop()!.replace(/\.md$/, '')))
	.filter((post) => previewDrafts || !post.draft)
	.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
export const summaries = posts.map(({ html, toc, ...post }) => post);
export const published = posts.filter((post) => !post.draft);
