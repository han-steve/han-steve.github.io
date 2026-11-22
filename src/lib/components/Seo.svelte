<script lang="ts">
	import { page } from '$app/stores';
	let {
		title,
		description,
		image = '/assets/social.png',
		noindex = false,
		article = false
	}: {
		title: string;
		description: string;
		image?: string;
		noindex?: boolean;
		article?: boolean;
	} = $props();
	const origin = import.meta.env.VITE_SITE_ORIGIN || 'https://hansteve.com';
	const preview = import.meta.env.VITE_INCLUDE_DRAFTS === 'true';
</script>

<svelte:head>
	<title>{title}</title><meta name="description" content={description} /><link
		rel="canonical"
		href="{origin}{$page.url.pathname}"
	/>
	<meta property="og:title" content={title} /><meta
		property="og:description"
		content={description}
	/><meta property="og:type" content={article ? 'article' : 'website'} /><meta
		property="og:url"
		content="{origin}{$page.url.pathname}"
	/><meta property="og:image" content="{origin}{image}" /><meta
		property="og:site_name"
		content="Steve Han"
	/>
	<meta name="twitter:card" content="summary_large_image" /><meta
		name="robots"
		content={noindex || preview ? 'noindex, nofollow' : 'index, follow'}
	/>
</svelte:head>
