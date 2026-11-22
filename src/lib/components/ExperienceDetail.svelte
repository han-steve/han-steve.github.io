<script lang="ts">
	import CompanyMark from '$lib/components/CompanyMark.svelte';
	import type { ExperienceItem } from '$lib/experience';
	import { projectTransitionSlug } from '$lib/stores';
	let { job }: { job: ExperienceItem } = $props();
	const transitionName = $derived(`experience-${job.slug}`);
	const shared = $derived($projectTransitionSlug === transitionName ? `project-${transitionName}` : undefined);
</script>

<article class="job">
	<header>
		<div class="company-heading">
			<CompanyMark slug={job.slug} detail />
			<h1 id="experience-title" tabindex="-1" data-experience-part="title"
				style:view-transition-name={shared && `${shared}-title`}>{job.company}</h1>
		</div>
		<p class="page-lede">{job.role}</p>
		<p class="small muted">{job.period} · {job.location}</p>
	</header>
	{#each job.sections as section}
		<section>
			{#if section.title}<h2>{section.title}</h2>{/if}
			{#if Array.isArray(section.body)}
				<ul class="accomplishments">
					{#each section.body as bullet}<li>{bullet}</li>{/each}
				</ul>
			{:else}
				<p>{section.body}</p>
			{/if}
			{#if section.figure}
				{@const figure = section.figure}
				<figure class="job-figure">
					<div class:portrait={figure.height > figure.width}>
						<img src={figure.image} alt={figure.alt} width={figure.width} height={figure.height}
							loading="lazy" decoding="async" />
					</div>
					<figcaption>
						{figure.caption}
					</figcaption>
				</figure>
		{/if}
			{#if section.articles}
				<ul class="articles" aria-label={job.company + ' Engineering articles'}>
					{#each section.articles as article}
						<li>
							<a class="text-link" href={article.url}>{article.title}</a>
							<span class="small muted">{job.company} Engineering · {article.date}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
	{#if job.links?.length}
		<section><h2>Talks and code</h2>
			<ul>{#each job.links as link}<li><a class="text-link" href={link.url}>{link.label}</a></li>{/each}</ul>
		</section>
	{/if}
	<footer><a class="text-link" href="/cv/">Full CV</a></footer>
</article>
<style>
	.job { max-width: 72ch; margin-inline: auto; padding: var(--sheet-controls-height) clamp(24px, 5vw, 48px) 48px; overflow-wrap: anywhere; }
	.company-heading { --company-mark-size: clamp(40px, 6vw, 48px); display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
	.job h1 { margin: 0; font-size: clamp(28px, 4vw, 36px); line-height: 1.2; }
	.job h1:focus { outline: none; }
	.job header { margin-bottom: 32px; }
	.job header p { margin: 6px 0; }
	.job section { margin: 24px 0; }
	.job h2 { font-size: 20px; margin-bottom: 8px; }
	.job p { line-height: 1.65; }
	.job li { margin: 8px 0; }
	.accomplishments { list-style: disc; padding-inline-start: 1.25rem; line-height: 1.6; }
	.articles { list-style: none; padding: 0; }
	.articles li { margin: 12px 0; }
	.articles span { display: block; }
	.job-figure { margin: 18px 0 0; }
	.job-figure img { display: block; width: 100%; height: auto; border-radius: 8px; }
	.job-figure .portrait {
		display: grid; place-items: center; padding: 16px;
		border-radius: 8px; background-color: light-dark(#f5f5f4, #242426);
	}
	.job-figure .portrait img { width: auto; max-width: 100%; height: auto; max-height: 24rem; }
	.job-figure figcaption { color: var(--muted); margin: 8px 0 0; font-size: 0.875rem; line-height: 1.5; }
	.job footer { margin-top: 32px; }
</style>
