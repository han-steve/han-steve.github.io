<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	let { data } = $props();
	let post = $derived(data.post);
	const date = (value: string) =>
		new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(value));
</script>

<Seo title="{post.title} — Steve Han" description={post.description} noindex={post.draft} article />
<article class="shell article-shell">
	<a class="back-link" href="/blog">All posts</a>
	<header class="article-head">
		<p class="eyebrow">
			{post.category}{#if post.draft}<span class="draft-badge">Draft</span>{/if}
		</p>
		<h1>{post.title}</h1>
		<div class="article-meta">
			<span>Steve Han</span><span aria-hidden="true">/</span><time datetime={post.date}
				>{date(post.date)}</time
			><span aria-hidden="true">/</span><span>{post.minutes} min read</span>
		</div>
	</header>
	{#if post.toc.length}<details class="article-toc">
			<summary>On this page</summary>
			<ol>
				{#each post.toc as heading}<li><a href="#{heading.id}">{heading.title}</a></li>{/each}
			</ol>
		</details>{/if}
	<div class="prose">{@html post.html}</div>
	<footer class="article-end">
		<a class="inline-link" href="/blog">All posts</a><a
			class="inline-link"
			href="mailto:stevehan2001@gmail.com">Email Steve</a
		>
	</footer>
</article>
