import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { parsePost, xml } from '../src/lib/server/markdown';
const front =
	'---\ntitle: A note\ndescription: A test\ndate: 2026-10-24\ncategory: Systems\ndraft: true\n---\n';

test('Markdown cannot create executable raw HTML or unsafe links', () => {
	const post = parsePost(
		front +
			'<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n[good](https://example.com)',
		'safe-note'
	);
	assert.ok(!post.html.includes('<script>'));
	assert.ok(!post.html.includes('href="javascript:'));
	assert.ok(post.html.includes('href="https://example.com"'));
});
test('duplicate and punctuation-only headings receive unique usable anchors', () => {
	const post = parsePost(front + '## Same\n\n## Same\n\n## !!!\n\n## !!!', 'anchors');
	assert.deepEqual(
		post.toc.map((h) => h.id),
		['same', 'same-2', 'section', 'section-2']
	);
});
test('malformed, missing, duplicate and impossible frontmatter fails the build', () => {
	for (const source of [
		front.replace('draft: true\n', ''),
		front.replace('true', 'yes'),
		front.replace('2026-10-24', '2026-02-30'),
		front.replace('title: A note', 'title: A note\ntitle: Duplicate'),
		'No frontmatter'
	])
		assert.throws(() => parsePost(source, 'invalid-note'));
	assert.throws(() => parsePost(front, '../escape'));
});
test('feed fields escape XML control characters', () => {
	assert.equal(xml('<a & "b">\''), '&lt;a &amp; &quot;b&quot;&gt;&apos;');
});
