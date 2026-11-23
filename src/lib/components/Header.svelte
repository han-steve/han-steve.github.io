<script lang="ts">
	import { beforeNavigate, preloadData } from '$app/navigation';
	import { headerAnimationComplete } from '$lib/stores';
	import { navigating, page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import ThemeCord from './ThemeCord.svelte';
	let dark = $state(false);
	let identity = $state<HTMLDivElement>();
	let backdrop: HTMLDivElement;
	let entrance: Animation[] = [];
	let entranceTimer: ReturnType<typeof setTimeout> | undefined;
	let introRunning = $state(false);
	let entranceGeneration = 0;
	const isHome = $derived($page.url.pathname === '/');
	const selectedPath = $derived($navigating?.to?.url.pathname || $page.url.pathname);
	let { onPagePull }: { onPagePull: (path?: string, changeTheme?: () => void) => void } = $props();

	let repeatTug: Animation | undefined;

	function pullTab(event: MouseEvent) {
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const link = event.currentTarget as HTMLAnchorElement;
		const ribbon = link.querySelector<HTMLElement>('.tab-ribbon');
		const startingOffset = ribbon ? getComputedStyle(ribbon).translate : 'none';
		repeatTug?.cancel();
		if (ribbon && link.pathname === $page.url.pathname && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
			repeatTug = ribbon.animate([
				{ translate: startingOffset, easing: 'ease-out' },
				{ translate: '0 14px', offset: .45, easing: 'ease-in-out' },
				{ translate: '0 0' }
			], { duration: 330 });
		}
		onPagePull(link.pathname);
	}

	function warmFocusedTab(event: FocusEvent) {
		const link = event.currentTarget as HTMLAnchorElement;
		const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
		if (connection?.saveData || link.pathname === location.pathname || !link.matches(':focus-visible')) return;
		void preloadData(link.href).catch(() => {});
	}

	function resetEntrance() {
		entranceGeneration++;
		clearTimeout(entranceTimer);
		entrance.forEach(animation => animation.cancel());
		entrance = [];
	}
	function finishEntrance() {
		resetEntrance();
		introRunning = false;
		window.__siteEntrance?.release();
		delete document.documentElement.dataset.entrance;
		headerAnimationComplete.set(true);
	}
	async function replayEntrance() {
		resetEntrance();
		if (!identity || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finishEntrance();
			return;
		}
		const generation = entranceGeneration;
		const root = document.documentElement;
		// Keep the pre-paint guard until the component and its first animation frame are ready.
		const pending = root.dataset.entrance === 'pending';
		root.dataset.entrance = pending ? 'pending' : 'running';
		headerAnimationComplete.set(false);
		introRunning = true;
		try {
			const offset = Math.max(0, innerHeight / 2 - identity.getBoundingClientRect().top - identity.offsetHeight / 2);
			const settleAt = 3000;
			const settleDuration = 1000;
			entrance.push(identity.animate([
				{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }
			], { delay: settleAt, duration: settleDuration, easing: 'ease-in-out', fill: 'backwards' }));
			const fade: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
			function reveal(selector: string, delay: number, duration: number, frames = fade, easing = 'linear') {
				const element = identity?.querySelector(selector);
				if (element) entrance.push(element.animate(frames, { delay, duration, easing, fill: 'backwards' }));
			}
			reveal('.greeting-hi', 400, 400);
			reveal('.greeting-im', 900, 400);
			reveal('.header-name', 1000, 1200, [
				{ opacity: 0, filter: 'blur(5px)' }, { opacity: 1, filter: 'blur(0)' }
			], 'ease-in-out');
			reveal('.header-summary', 2000, 500, [
				{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }
			], 'cubic-bezier(.215,.61,.355,1)');
			identity.querySelectorAll('.summary-phrase').forEach((phrase, index) => {
				entrance.push(phrase.animate(fade, { delay: 2040 + index * 110, duration: 330, fill: 'backwards' }));
			});
			reveal('.replay-button', settleAt, settleDuration);
			entrance.push(backdrop.animate([
				{ opacity: 1 }, { opacity: 0 }
			], { delay: 3500, duration: 500, fill: 'both' }));
			await tick();
			if (generation !== entranceGeneration) return;
			root.dataset.entrance = 'running';
			window.__siteEntrance?.release();
			entranceTimer = setTimeout(finishEntrance, settleAt + settleDuration);
		} catch { finishEntrance(); }
	}
	beforeNavigate(finishEntrance);
	const routes = [
		{ name: 'Projects', href: '/projects' },
		{ name: 'CV', href: '/cv' }
	];
	onMount(() => {
		const media = matchMedia('(prefers-color-scheme: dark)');
		dark = document.documentElement.dataset.theme === 'dark';
		const pending = document.documentElement.dataset.entrance === 'pending';
		try { localStorage.setItem('skipAnimation', 'TRUE'); } catch { /* Static page still works. */ }
		if (isHome && pending) void replayEntrance();
		else finishEntrance();
		window.addEventListener('pagehide', finishEntrance);
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const stopForMotion = () => {
			if (motion.matches) {
				repeatTug?.cancel();
				finishEntrance();
			}
		};
		motion.addEventListener('change', stopForMotion);
		const sync = () => {
			let saved: string | null = null;
			try {
				saved = localStorage.getItem('theme');
			} catch {
				/* Use the system preference. */
			}
			dark = saved === 'dark' || (saved !== 'light' && media.matches);
			document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		};
		const stored = (event: StorageEvent) => {
			if (event.key === 'theme' || event.key === null) sync();
		};
		media.addEventListener('change', sync);
		window.addEventListener('storage', stored);
		return () => {
			repeatTug?.cancel();
			finishEntrance();
			motion.removeEventListener('change', stopForMotion);
			media.removeEventListener('change', sync);
			window.removeEventListener('pagehide', finishEntrance);
			window.removeEventListener('storage', stored);
		};
	});
	function toggleTheme() {
		dark = !dark;
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			/* Works for this visit. */
		}
	}
</script>
<div class="entrance-backdrop" class:running={introRunning} bind:this={backdrop} aria-hidden="true"></div>
<header class="site-header">
	<div class="header-identity" bind:this={identity}>
		<p class="header-greeting"><span class="greeting-hi">Hi,</span> <span class="greeting-im">I'm</span></p>
		<svelte:element this={isHome ? 'h1' : 'div'} class="header-name"><a href="/">Steve Han.</a></svelte:element>
		<p class="header-summary">
			<span class="light">I build</span>
			<span class="summary-phrase">AI infrastructure</span><br />
			<span class="summary-phrase"><span class="light">for</span> agents<span class="light">,</span></span>
			<span class="summary-phrase">distributed training<span class="light">,</span></span><br />
			<span class="summary-phrase"><span class="light">and</span> production inference<span class="light">.</span></span>
			<button class="replay-button" onclick={replayEntrance} aria-label="Replay entrance animation" title="Replay entrance animation">
				<svg width="15" height="15" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true">
					<path d="M21 18l10 6-10 6z" stroke-linejoin="round" /><path d="M11 37a18 18 0 1 0 0-26l-5 6M6 9v8h8" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</p>
	</div>
	<div class="header-controls">
		<nav aria-label="Main navigation" data-sveltekit-preload-code="viewport">
			{#each routes as route}
				<a
					class="route"
					class:selected={selectedPath.startsWith(route.href)}
					href={route.href + '/'}
					onfocus={warmFocusedTab}
					onclick={pullTab}
					aria-current={$page.url.pathname.startsWith(route.href) ? 'page' : undefined}
				>
					<span class="tab-idle">{route.name.toUpperCase()}</span>
					<span class="tab-track" aria-hidden="true">
						<span class="tab-ribbon"><span class="tab-label">{route.name.toUpperCase()}</span></span>
					</span>
				</a>
			{/each}
		</nav>
		<ThemeCord {dark} onpull={() => onPagePull(undefined, toggleTheme)} />
	</div>
</header>
