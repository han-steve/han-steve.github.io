<script lang="ts">
	import type { Project } from '$lib/projects';
	import { page } from '$app/stores';
	import { isSheetRoute, shallowPath } from '$lib/sheet-navigation';
	import { projectTransitionSlug } from '$lib/stores';
	let { project }: { project: Project } = $props();
	const covered = $derived(!!shallowPath($page.state) || isSheetRoute($page.route.id));
	const moving = $derived(!covered && $projectTransitionSlug === project.slug);
</script>

<a class="project-row" href="/projects/{project.slug}" aria-label="Explore {project.title}">
	<div class="project-art {project.slug}">
		<span class="project-tile-surface" data-project-surface={project.slug}
			style:view-transition-name={moving ? `project-${project.slug}-surface` : 'none'}></span>
		<!-- The icon carries its own clip; its background expands independently. -->
		<span class="project-icon {project.slug}"
			style:view-transition-name={moving ? `project-${project.slug}-art` : 'none'}>
			{#if project.image}<img src={project.image} alt="" width="160" height="160" loading="lazy" />
			{:else}<span class="project-glyph" aria-hidden="true">{project.glyph}</span>{/if}
		</span>
	</div>
	<div class="project-copy">
		<h3>{project.title}</h3>
		<p>{project.description}</p>
		<span class="project-tags"><span>{project.year}</span><span class="project-tag">{project.category}</span></span>
	</div>
</a>
