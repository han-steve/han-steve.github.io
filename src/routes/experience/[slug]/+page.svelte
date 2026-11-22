<script lang="ts">
	import DetailSheet from '$lib/components/DetailSheet.svelte';
	import Seo from '$lib/components/Seo.svelte';
	let { data } = $props();
</script>

<Seo title={data.job.company + ' — Steve Han'} description={data.job.description} />
{#key data.job.slug}<DetailSheet detail={{ kind: 'experience', item: data.job }} />{/key}
