<script lang="ts">
	let { slug, detail = false }: { slug: string; detail?: boolean } = $props();
	const artwork: Record<string, string> = {
		roblox: 'roblox.svg',
		amazon: 'amazon.png',
		orca: 'orca.png',
		'dive-chat': 'dive-chat.png'
	};
</script>

{#if artwork[slug]}
	<img class="company-mark" style:view-transition-name={detail ? 'project-experience-' + slug + '-art' : undefined} src={'/assets/companies/' + artwork[slug]} alt="" width="40" height="40" />
{/if}

<style>
	.company-mark {
		display: block;
		view-transition-class: company-art;
		flex: none;
		width: var(--company-mark-size, 40px);
		height: var(--company-mark-size, 40px);
		border-radius: 23%;
	}
</style>
