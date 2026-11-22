<script lang="ts">
	import { projects, hackathons } from '$lib/projects';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	const filters = ['All', 'Robotics & ML', 'Web & hardware'];
	let filter = $state('All');
	let filtered = $derived(
		projects.filter(
			(p) =>
				filter === 'All' ||
				(filter === 'Robotics & ML'
					? ['trill', 'self-steering-scooter'].includes(p.slug)
					: ['voxcraft-vr', 'project-sunrise'].includes(p.slug))
		)
	);
</script>

<Seo
	title="Projects — Steve Han"
	description="Steve Han’s projects in robotics, VR and home automation."
/>
<section class="shell project-archive" aria-labelledby="projects-title">
	<h1 id="projects-title">Projects</h1>
	<div class="filter-bar" role="group" aria-label="Filter projects">
		{#each filters as label}<button
				class:active={filter === label}
				aria-pressed={filter === label}
				onclick={() => (filter = label)}><span>{label}</span></button
			>{/each}<span class="filter-count" aria-live="polite">{filtered.length} projects</span>
	</div>
	<div class="project-list">
		{#each filtered as project}<ProjectCard {project} />{/each}
	</div>
	<section class="hackathons" aria-labelledby="hackathons-heading">
		<h2 id="hackathons-heading">Hackathons</h2>
		{#each hackathons as project}
			<article class="hackathon-entry">
				<h3>{project.title}<span>{project.year}</span></h3>
				<p>{project.description}</p>
				<small>{project.event} · {project.award}</small>
				<a class="text-link" href={project.url}
					>View submission on Devpost<span class="sr-only"> — {project.title}</span></a>
			</article>
		{/each}
	</section>
</section>
