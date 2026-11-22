import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
const renderTableOpen = markdown.renderer.rules.table_open;
markdown.renderer.rules.table_open = (tokens, idx, options, env, self) =>
	'<div class="table-scroll" tabindex="0" role="region" aria-label="Comparison table">' +
	(renderTableOpen
		? renderTableOpen(tokens, idx, options, env, self)
		: self.renderToken(tokens, idx, options));
markdown.renderer.rules.table_close = () => '</table></div>\n';

export interface Post {
	slug: string;
	title: string;
	description: string;
	date: string;
	category: string;
	draft: boolean;
	minutes: number;
	html: string;
	toc: { id: string; title: string }[];
}

// A deliberately small frontmatter format: one scalar per line, no executable MDX.
export function parsePost(source: string, slug: string): Post {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid post slug: ' + slug);
	const match = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) throw new Error('Missing frontmatter: ' + slug);
	const attributes: Record<string, string> = {};
	const allowed = ['title', 'description', 'date', 'category', 'draft'];
	for (const line of match[1].split('\n')) {
		if (!line.trim() || line.trim().startsWith('#')) continue;
		const field = line.match(/^([a-z]+):\s*(.+)$/);
		if (!field || !allowed.includes(field[1]) || field[1] in attributes)
			throw new Error('Invalid frontmatter: ' + slug);
		attributes[field[1]] = field[2].trim();
	}
	for (const key of allowed) if (!attributes[key]) throw new Error('Missing ' + key + ': ' + slug);
	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(attributes.date) ||
		!Number.isFinite(Date.parse(attributes.date)) ||
		new Date(attributes.date).toISOString().slice(0, 10) !== attributes.date
	)
		throw new Error('Invalid post date: ' + slug);
	if (!['true', 'false'].includes(attributes.draft)) throw new Error('Invalid draft flag: ' + slug);
	const tokens = markdown.parse(match[2], {});
	const toc: Post['toc'] = [];
	const used = new Map<string, number>();
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].type === 'heading_open') {
			const title = tokens[i + 1].content;
			const base =
				title
					.toLowerCase()
					.normalize('NFKD')
					.replace(/[^a-z0-9\s-]/g, '')
					.trim()
					.replace(/\s+/g, '-') || 'section';
			const n = used.get(base) || 0;
			used.set(base, n + 1);
			const id = n ? `${base}-${n + 1}` : base;
			tokens[i].attrSet('id', id);
			if (tokens[i].tag === 'h2') toc.push({ id, title });
		}
	}
	return {
		slug,
		title: attributes.title,
		description: attributes.description,
		date: attributes.date,
		category: attributes.category,
		draft: attributes.draft === 'true',
		minutes: Math.max(1, Math.ceil(match[2].trim().split(/\s+/).length / 220)),
		html: markdown.renderer.render(tokens, markdown.options, {}),
		toc
	};
}

export function xml(value: string): string {
	return value.replace(
		/[<>&"']/g,
		(char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!
	);
}
