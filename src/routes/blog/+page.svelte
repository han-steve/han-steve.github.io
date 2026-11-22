<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	let { data } = $props();
	let query = $state('');
	let category = $state('All notes');
	let categories = $derived(['All notes', ...new Set(data.posts.map((post) => post.category))]);
	let filtered = $derived(
		data.posts.filter(
			(post) =>
				(category === 'All notes' || post.category === category) &&
				(post.title + ' ' + post.description).toLowerCase().includes(query.toLowerCase().trim())
		)
	);
	const date = (value: string) =>
		new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(value));
</script>

<Seo
	title="Blog — Steve Han"
	description="Steve Han’s writing on Kubernetes and machine learning infrastructure."
/>
<div class="shell page-top">
	<h1>Blog</h1>
</div>
<section class="shell blog-layout" aria-label="Writing">
	{#if data.posts.length}
	<div class="blog-tools">
		<div class="filter-bar" role="group" aria-label="Filter writing">
			{#each categories as label}<button
					class:active={category === label}
					aria-pressed={category === label}
					onclick={() => (category = label)}>{label}</button
				>{/each}
		</div>
		<label class="sr-only" for="search-notes">Search notes</label><input
			class="search-field"
			id="search-notes"
			type="search"
			bind:value={query}
			placeholder="Find a note…"
		/>
	</div>
	{/if}
	<div class="blog-posts">
		<div aria-live="polite">
			<span class="sr-only">{filtered.length} notes</span>{#each filtered as post}<a
					class="post-row"
					href="/blog/{post.slug}"
					><div>
						<p class="eyebrow">
							{post.category}{#if post.draft}<span class="draft-badge">Draft</span>{/if}
						</p>
						<h2>{post.title}</h2>
						<p>{post.description}</p>
						<span class="post-date"
							>{date(post.date)} <span class="dot">·</span> {post.minutes} min read</span
						>
					</div>
					</a
				>{/each}
		</div>
		{#if !filtered.length}<div class="no-results">
				{#if query || category !== 'All notes'}<p>No notes match this search.</p>
					<button
						class="button-link"
						onclick={() => {
							query = '';
							category = 'All notes';
						}}>Clear filters</button
					>{:else}<p>
						I spoke about batch inference and training at Roblox in <a
							class="text-link"
							href="/cv/#talks-and-articles">two Ray Summit talks</a
						>.
					</p>{/if}
			</div>{/if}
	</div>
	<p class="blog-rss"><a class="text-link" href="/feed.xml">Follow via RSS</a></p>
</section>
