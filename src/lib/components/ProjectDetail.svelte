<script lang="ts">
	import VideoEmbed from './VideoEmbed.svelte';
	import { projects, type Project } from '$lib/projects';
	let { project }: { project: Project } = $props();
	const next = $derived(projects[(projects.findIndex(item => item.slug === project.slug) + 1) % projects.length]);

	// A host may return the entire short replay for a byte-range request.
	// Give the native player a seekable local source only in that case.
	function enableReplaySeeking(video: HTMLVideoElement) {
		const controller = new AbortController();
		let localUrl: string | undefined;
		async function onLoadedData() {
			if (video.seekable.length && video.seekable.end(0) > 0) return;
			try {
				const response = await fetch(video.currentSrc, { signal: controller.signal });
				if (!response.ok) return;
				const clip = await response.blob();
				if (controller.signal.aborted) return;
				const position = video.currentTime;
				const playing = !video.paused;
				localUrl = URL.createObjectURL(clip);
				video.src = localUrl;
				video.currentTime = position;
				if (playing) await video.play();
			} catch {
				// The original media sources also work without this enhancement.
			}
		}
		if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) void onLoadedData();
		else video.addEventListener('loadeddata', onLoadedData, { once: true });
		return {
			destroy() {
				controller.abort();
				video.removeEventListener('loadeddata', onLoadedData);
				if (localUrl) URL.revokeObjectURL(localUrl);
			}
		};
	}
</script>

<article class="case-study">
	{#if project.videos?.[0]}
		<VideoEmbed {...project.videos[0]} hero projectSlug={project.slug} heroHeading={project.title} />
	{/if}
	<header class="project-intro">
		<div class="project-heading">
			<div class="project-title-art project-icon {project.slug}" style:view-transition-name={`project-${project.slug}-art`}>
				{#if project.image}<img src={project.image} alt="" width="96" height="96" />
				{:else}<span aria-hidden="true">{project.glyph}</span>{/if}
			</div>
			<div class="project-heading-copy"><h1 id="project-title" tabindex="-1">{project.title}</h1>
				{#if project.year !== 'University project'}<p class="project-year">{project.year}</p>{/if}
			</div>
		</div>
		<div class="project-links">
			{#each project.links as link}
				<a href={link.url}>
					<span>{link.label}</span>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						{#if link.url.startsWith('/')}
							<path d="M6 3h8l5 5v13H6z M14 3v6h5 M9 13h7 M9 16h5" />
						{:else}
							<path d="M14 4h6v6 M20 4l-9 9 M10 6H5v13h13v-5" />
						{/if}
					</svg>
				</a>
			{/each}
		</div>
	</header>
	<div class="project-details" id="project-details">
		<div class="case-facts">
			<div><span class="eyebrow">Project</span><p>{project.role}</p></div>
			<div><span class="eyebrow">Built with</span><ul class="project-tool-list" aria-label="Built with">
				{#each project.tools as tool}<li class="project-tag">{tool}</li>{/each}
			</ul></div>
		</div>
		<div class="case-body">
			{#each project.sections as section}
				<div class="project-block">
					{#if section.title}<h2>{section.title}</h2>{/if}
					{#if section.body}<p>{section.body}</p>{/if}
					{#if section.features}
						<dl class="feature-list">
							{#each section.features as feature}
								<div>
									<dt>{feature.name}</dt>
									<dd>
										{feature.detail}
										{#if feature.demos}
											<div class="feature-demos">
												{#each feature.demos as demo}
													<figure>
														<img src={demo.gif} alt={demo.alt} width={demo.size} height={demo.size} loading="lazy" decoding="async" />
														<figcaption>{demo.label}</figcaption>
													</figure>
												{/each}
											</div>
										{/if}
									</dd>
								</div>
							{/each}
						</dl>
					{/if}
					{#if section.figure}
						{@const figure = section.figure}
						<figure class="project-figure">
							{#if figure.replay}
								<video use:enableReplaySeeking controls muted playsinline preload="metadata" poster={figure.image}
									width={figure.width} height={figure.height} aria-label={figure.alt}>
									<source src={figure.replay.webm} type="video/webm" />
									<source src={figure.replay.mp4} type="video/mp4" />
								</video>
							{:else}
								<img src={figure.image} alt={figure.alt} width={figure.width} height={figure.height}
									loading="lazy" decoding="async" />
							{/if}
							<figcaption>{figure.caption}</figcaption>
						</figure>
					{/if}
				</div>
			{/each}
		</div>
		{#if project.videos && project.videos.length > 1}<section class="case-videos" aria-label="Project videos">
			<h2>More talks</h2>
			{#each project.videos.slice(1) as video (video.title)}<VideoEmbed {...video} />{/each}
		</section>{/if}
	</div>
	<nav class="project-next" aria-label="Next project">
		<a class="next-project" href="/projects/{next.slug}/"><span><span class="eyebrow">Next project</span><h2>{next.title}</h2></span>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
		</a>
	</nav>
</article>

<style>
	.feature-list { margin: 0; }
	.feature-list > div + div { margin-top: 1rem; }
	.feature-list dt { font-weight: 600; }
	.feature-list dd { margin: .15rem 0 0; line-height: 1.65; }
	.feature-demos { display: flex; flex-wrap: wrap; align-items: start; gap: .75rem; margin-top: .75rem; }
	.feature-demos figure { flex: 0 1 180px; max-width: 100%; margin: 0; }
	.feature-demos img { display: block; width: 100%; height: auto; border-radius: .5rem; }
	.feature-demos figcaption { font-size: .875rem; margin-top: .25rem; color: var(--muted); }
	@media (max-width: 480px) {
		.feature-demos figure { flex-basis: min(180px, calc((100% - .75rem) / 2)); }
		.feature-demos figure:only-child { flex-basis: 180px; }
	}
	.project-figure {
		margin: 1rem 0 0;
	}
	.project-figure img,
	.project-figure video {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 0.5rem;
	}
	.project-figure figcaption {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
