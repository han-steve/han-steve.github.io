<script lang="ts">
	import CompanyMark from '$lib/components/CompanyMark.svelte';
	import { experienceSurface } from '$lib/sheet-navigation';
	import { experience } from '$lib/experience';
</script>

<section class="section experience" aria-labelledby="experience-heading">
	<div class="section-heading">
		<h2 id="experience-heading">Experience</h2>
		<a class="link inline-link" href="/cv">Full CV</a>
	</div>
	<div class="experience-list">
		{#each experience as item}
			<a use:experienceSurface class="experience-row" href={`/experience/${item.slug}/`}>
				<CompanyMark slug={item.slug} />
				<div class="experience-copy">
					<div class="experience-heading">
						<h3 data-experience-part="title">{item.company}</h3>
						{#if item.period}<span class="experience-period">{item.period}</span>{/if}
					</div>
					{#if item.role}<span class="experience-role">{item.role}</span>{/if}
					<p>{item.description}</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<style>
	.experience-list {
		display: grid;
		gap: 4px;
	}
	.experience-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		column-gap: 14px;
		padding: 16px;
		margin-inline: -16px;
		border-radius: 14px;
		transition: background 180ms, box-shadow 180ms;
	}
	.experience-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 5px;
	}
	.experience-heading h3 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		line-height: 1.35;
	}
	.experience-period {
		flex-shrink: 0;
		font-size: 12px;
		color: var(--muted);
	}
	.experience-role {
		display: block;
		font-size: 14px;
		margin-bottom: 5px;
	}
	.experience-row p {
		margin: 0;
		font-size: 16px;
		line-height: 1.5;
		color: var(--muted);
	}
	@media (prefers-reduced-motion: reduce) {
		.experience-row { transition: none; }
	}
	@media (max-width: 450px) {
		.experience-row { --company-mark-size: 32px; column-gap: 10px; }
		.experience-heading { flex-wrap: wrap; gap: 2px 12px; }
		.experience-heading h3 { font-size: 18px; }
	}
</style>
