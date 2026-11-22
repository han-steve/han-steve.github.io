<script lang="ts">
	import { page } from '$app/stores';
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo title="{$page.status} — Steve Han" description="That page could not be found." noindex />
<div class="shell error-page">
	<p class="eyebrow">{$page.status}</p>
	<h1>{$page.status === 404 ? 'Page not found' : 'Couldn’t load this page'}</h1>
	<a class="button-link primary-link" href="/">Head home</a>
</div>
