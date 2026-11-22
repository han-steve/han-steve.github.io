import { experience } from '$lib/experience';
import { projects } from '$lib/projects';
export const prerender = true;
export const GET = () => {
	const paths = [
		'/',
		'/projects/',
		'/cv/',
		...experience.map((job) => '/experience/' + job.slug + '/'),
		...projects.map((p) => '/projects/' + p.slug + '/')
	];
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://hansteve.com${path}</loc></url>`).join('')}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	);
};
