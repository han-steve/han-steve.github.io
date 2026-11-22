<script lang="ts">
	let { href, title, image, source, date, description = '' }: {
		href: string; title: string; image: string; source: string; date: string; description?: string;
	} = $props();
</script>

<a class="preview" {href} aria-label={title}>
	<img src={image} alt="" width="160" height="90" loading="lazy" decoding="async" />
	<span class="copy">
		<span class="meta"><span class="publisher">{source}<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6m0-6L10 14M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></span> · {date}</span>
		<span class="title">{title}</span>
		{#if description}<span class="description">{description}</span>{/if}
	</span>
</a>

<style>
	.preview {
		display: grid;
		grid-template-columns: clamp(6.25rem, 18vw, 9rem) minmax(0, 1fr);
		align-items: center;
		gap: clamp(.8rem, 2.5vw, 1.25rem);
		padding: .55rem;
		margin-inline: -.55rem;
		border-radius: .75rem;
		color: var(--ink);
		transition: background-color 140ms ease, box-shadow 140ms ease;
	}
	img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; background: var(--soft); border-radius: .45rem; }
	.copy { min-width: 0; display: grid; gap: .22rem; }
	.meta, .description { color: var(--muted); }
	.meta { font-size: .8125rem; line-height: 1.35; }
	.publisher { white-space: nowrap; }
	.title { text-wrap: pretty; font-weight: 600; font-size: 1rem; line-height: 1.35; }
	svg { display: inline-block; margin-left: .32em; vertical-align: .04em; color: var(--muted); }
	.description { font-size: .875rem; line-height: 1.5; }
	@media (hover: hover) {
		.preview:hover { background: var(--hover-surface); box-shadow: var(--hover-shadow); }
		.preview:hover .title { text-decoration: underline; text-underline-offset: .16em; text-decoration-thickness: 1px; }
	}
	.preview:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; background: var(--hover-surface); }
	@media (max-width: 480px) {
		.preview { grid-template-columns: 5.75rem minmax(0, 1fr); align-items: start; }
		.preview:has(.description) .copy { display: contents; }
		.preview:has(.description) { row-gap: .22rem; }
		.preview:has(.description) img { grid-row: 1 / 3; }
		.preview:has(.description) .description { grid-column: 1 / -1; margin-top: .15rem; }
	}
	@media (prefers-reduced-motion: reduce) { .preview { transition: none; } }
</style>
