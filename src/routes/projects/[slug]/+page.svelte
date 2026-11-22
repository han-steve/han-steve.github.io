<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import DetailSheet from '$lib/components/DetailSheet.svelte';
	let { data } = $props();
</script>
<Seo title="{data.project.title} — Steve Han" description={data.project.description} image={data.project.image || '/assets/social.png'} />
{#key data.project.slug}<DetailSheet detail={{ kind: 'project', item: data.project }} />{/key}
