<script lang="ts">
	import '../app.postcss';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import DetailSheet from '$lib/components/DetailSheet.svelte';
	import Experience from '$lib/components/Experience.svelte';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { detailAt, interceptSheetLink, isSheetRoute, shallowPath, sheetKey, sheetTransition } from '$lib/sheet-navigation';
	import { projects } from '$lib/projects';
	let { children } = $props();
	let main = $state<HTMLElement>();
	let pageAnimation: Animation | undefined;
	const directProject = $derived($page.route.id === '/projects/[slug]');
	const directExperience = $derived($page.route.id === '/experience/[slug]');
	const selected = $derived(detailAt(shallowPath($page.state)));
	const covered = $derived(directProject || directExperience || !!selected);
	let pulledPath: string | undefined;

	function stopMotion() {
		pageAnimation?.cancel();
	}

	function pullTab(path: string) {
		if (!main || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const pageStart = getComputedStyle(main);
		const initial = { transform: pageStart.transform, opacity: pageStart.opacity };
		stopMotion();
		pulledPath = path;
		// Keep the original two 250 ms fly phases independent of route loading.
		pageAnimation = main.animate([
			{ ...initial, easing: 'ease-out' },
			{ transform: 'translateY(10px)', opacity: .65, offset: .5, easing: 'ease-out' },
			{ transform: 'translateY(0)', opacity: 1 }
		], { duration: 500 });
	}

	onMount(() => {
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const preferenceChanged = () => { if (motion.matches) stopMotion(); };
		motion.addEventListener('change', preferenceChanged);
		document.addEventListener('click', interceptSheetLink, true);
		return () => {
			stopMotion();
			motion.removeEventListener('change', preferenceChanged);
			document.removeEventListener('click', interceptSheetLink, true);
		};
	});
	onNavigate(navigation => {
		const wasPulled = pulledPath === navigation.to?.url.pathname;
		pulledPath = undefined;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		if (isSheetRoute(navigation.from?.route.id) || isSheetRoute(navigation.to?.route.id)) {
			stopMotion();
			return new Promise<void>(resolve => {
				void sheetTransition(async () => { resolve(); await navigation.complete; }, detailAt(navigation.to?.url.pathname) || detailAt(navigation.from?.url.pathname));
			});
		}
		if (wasPulled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return () => {
			stopMotion();
			pageAnimation = main?.animate([
				{ opacity: .75, transform: 'translateY(5px)' },
				{ opacity: 1, transform: 'translateY(0)' }
			], { duration: 150, easing: 'ease-out' });
		};
	});
</script>

<a class="skip-link" href={directExperience || selected?.kind === 'experience' ? '#experience-title' : covered ? '#project-title' : '#main'}>Skip to content</a>
<div class="site-shell" class:home={$page.route.id === '/'} inert={covered} aria-hidden={covered ? 'true' : undefined}>
	<Header onTabPull={pullTab} />
	<main id="main" tabindex="-1" bind:this={main}>
		{#if directProject}
			<div class="page-top"><h2>Projects</h2></div>
			<div class="project-list">{#each projects as project}<ProjectCard {project} />{/each}</div>
		{:else if directExperience}
			<Experience />
		{:else}{@render children()}{/if}
	</main>
	<Footer />
</div>
{#if directProject || directExperience}
	{@render children()}
{:else if selected}
	{#key sheetKey(selected)}<DetailSheet detail={selected} />{/key}
{/if}
