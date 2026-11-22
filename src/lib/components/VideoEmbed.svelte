<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { navigationTransitionActive } from '$lib/stores';
	import { loadYouTube, type YouTubePlayer } from '$lib/youtube';
	let {
		id, src, mp4, title, poster, hero = false,
		projectSlug, heroHeading
	}: {
		id?: string; src?: string; mp4?: string; title: string; poster: string;
		hero?: boolean; projectSlug?: string; heroHeading?: string;
	} = $props();
	let playing = $state(false);
	let muted = $state(true);
	let requested = $state(false);
	let ready = $state(false);
	let nativeControls = $state(false);
	let failed = $state(false);
	let origin = $state('');
	let video = $state<HTMLVideoElement>();
	let iframe = $state<HTMLIFrameElement>();
	let frame = $state<HTMLDivElement>();
	let tube: YouTubePlayer | undefined;
	let timelineRequest: AbortController | undefined;
	let clipUrl: string | undefined;
	let manualPause = false;
	let generation = 0;
	let readyTimeout: ReturnType<typeof setTimeout> | undefined;
	const revealed = $derived(ready && !$navigationTransitionActive && !failed);
	const embedURL = $derived(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`);

	function togglePlayback() {
		if (!video) return;
		manualPause = !video.paused;
		if (video.paused) void video.play().catch(() => { playing = false; });
		else video.pause();
	}
	function toggleAudio() {
		if (!video) return;
		video.muted = !video.muted;
		muted = video.muted;
	}
	async function watch() {
		if (requested) return;
		failed = false;
		requested = true;
		const current = ++generation;
		readyTimeout = setTimeout(() => {
			if (current === generation && !ready) { closePlayer(); failed = true; }
		}, 15000);
		try {
			await tick();
			const api = await loadYouTube();
			if (current !== generation || !iframe) return;
			tube = new api.Player(iframe, { events: {
				onReady: ({ target }) => {
					if (current !== generation) return;
					clearTimeout(readyTimeout);
					ready = true;
					target.playVideo();
				},
				onStateChange: ({ data }) => { if (current === generation) playing = data === 1; },
				onError: () => { if (current === generation) { closePlayer(); failed = true; } }
			} });
		} catch {
			if (current === generation) { closePlayer(); failed = true; }
		}
	}
	function closePlayer() {
		generation++;
		clearTimeout(readyTimeout);
		tube?.destroy();
		tube = undefined;
		requested = ready = playing = false;
	}
	async function prepareTimeline() {
		const player = video;
		if (!nativeControls || !player || !Number.isFinite(player.duration) || clipUrl || timelineRequest) return;
		const ranges = player.seekable;
		if (ranges.length && ranges.end(ranges.length - 1) >= player.duration - .05) return;
		// Static hosts can serve the short preview without byte-range support.
		// A local Blob lets the browser's own scrubber seek through that clip.
		const request = new AbortController();
		timelineRequest = request;
		try {
			const response = await fetch(player.currentSrc, { signal: request.signal });
			if (!response.ok) return;
			const clip = await response.blob();
			if (request.signal.aborted || !nativeControls) return;
			const { paused, currentTime } = player;
			clipUrl = URL.createObjectURL(clip);
			player.src = clipUrl;
			player.currentTime = currentTime;
			if (!paused) await player.play();
		} catch {
			// Keep the original stream playable if the clip is unavailable.
		} finally {
			timelineRequest = undefined;
		}
	}
	async function fullscreen() {
		if (!video) return;
		nativeControls = true;
		void prepareTimeline();
		try {
			if (document.fullscreenEnabled && video.requestFullscreen) await video.requestFullscreen();
			else (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
		} catch {
			// The native inline player remains usable if the browser denies fullscreen.
		}
	}
	onMount(() => {
		origin = location.origin;
		const player = video;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)');
		const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		let visible = false;
		let transitioning = false;
		const enterNativePlayer = () => { nativeControls = true; };
		const leaveNativePlayer = () => {
			if (player) manualPause = player.paused;
			nativeControls = false;
		};
		const fullscreenChanged = () => {
			if (document.fullscreenElement === player) enterNativePlayer();
			else leaveNativePlayer();
		};
		player?.addEventListener('fullscreenchange', fullscreenChanged);
		player?.addEventListener('webkitbeginfullscreen', enterNativePlayer);
		player?.addEventListener('webkitendfullscreen', leaveNativePlayer);
		const sync = () => {
			if ((!visible && !nativeControls) || document.hidden || transitioning) { player?.pause(); tube?.pauseVideo(); }
			else if (player && !nativeControls && !manualPause && !reduced.matches && !connection?.saveData)
				void player.play().catch(() => { playing = false; });
		};
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
			sync();
		}, { threshold: [0, 0.35] });
		if (frame) observer.observe(frame);
		const unsubscribe = navigationTransitionActive.subscribe(active => { transitioning = active; sync(); });
		const motionChanged = () => { if (reduced.matches) player?.pause(); else sync(); };
		reduced.addEventListener('change', motionChanged);
		document.addEventListener('visibilitychange', sync);
		return () => {
			generation++;
			clearTimeout(readyTimeout);
			observer.disconnect();
			unsubscribe();
			timelineRequest?.abort();
			if (clipUrl) URL.revokeObjectURL(clipUrl);
			player?.removeEventListener('fullscreenchange', fullscreenChanged);
			player?.removeEventListener('webkitbeginfullscreen', enterNativePlayer);
			player?.removeEventListener('webkitendfullscreen', leaveNativePlayer);
			player?.pause();
			tube?.destroy();
			reduced.removeEventListener('change', motionChanged);
			document.removeEventListener('visibilitychange', sync);
		};
	});
</script>

<figure class="video-figure" class:hero-video={hero}>
	<div class="video-frame" data-project={projectSlug} class:project-hero={hero}
		class:media-revealed={revealed} class:native-player={nativeControls} class:youtube-open={requested && revealed} class:transitioning={$navigationTransitionActive}
		bind:this={frame}>
		{#if src}
			<video class="media-player" bind:this={video} {poster} muted loop playsinline controls={!hero || nativeControls}
				preload={nativeControls ? 'metadata' : 'none'} aria-label={title} onerror={() => (failed = true)}
				onloadedmetadata={prepareTimeline} onseeked={() => (ready = true)}
				onvolumechange={(event) => (muted = event.currentTarget.muted)}
				onplaying={() => { playing = true; ready = true; }} onpause={() => (playing = false)}>
				<source {src} type="video/webm" />{#if mp4}<source src={mp4} type="video/mp4" />{/if}<track kind="captions" />
				<p><a href={mp4 || src}>Open {title}</a></p>
			</video>
		{:else if requested}
			<iframe class="media-player" bind:this={iframe} src={embedURL} {title}
				allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
				referrerpolicy="strict-origin-when-cross-origin"></iframe>
		{/if}
		<img class="media-poster" src={poster} alt={hero ? `${heroHeading} project preview` : ''}
			width="1440" height="810" loading={hero ? 'eager' : 'lazy'} fetchpriority={hero ? 'high' : 'auto'} />
		{#if hero}
			<div class="hero-shade" aria-hidden="true"></div>
		{/if}
		<div class="media-controls">
			{#if src}
				<div class="media-actions"><button class="media-button" onclick={togglePlayback} aria-label={playing ? 'Pause video preview' : 'Play video preview'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">{#if playing}<path d="M8 5v14M16 5v14" />{:else}<path d="m8 5 11 7-11 7z" />{/if}</svg><span>{playing ? 'Pause' : 'Play preview'}</span>
				</button>
				<button class="media-button icon-button" onclick={toggleAudio} aria-label={muted ? 'Unmute video' : 'Mute video'} title={muted ? 'Unmute video' : 'Mute video'}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M11 5 6 9H3v6h3l5 4V5Z" />
						{#if muted}<path d="m17 9 5 6m0-6-5 6" />
						{:else}<path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />{/if}
					</svg>
				</button>
				<button class="media-button icon-button" onclick={fullscreen} aria-label="Expand video" title="Expand video"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg></button></div>
			{:else}
				<button class="media-button watch-button" onclick={watch} disabled={requested} aria-label={`Play ${title}`}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">{#if requested}<circle cx="12" cy="12" r="8" stroke-dasharray="4 4" />{:else}<path d="m8 5 11 7-11 7z" />{/if}</svg>{requested ? 'Loading video…' : 'Play video'}
				</button>
			{/if}
		</div>
		{#if requested}<button class="close-video media-button" onclick={closePlayer} aria-label="Close video"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg><span>Close video</span></button>{/if}
		{#if failed}<p class="video-error" role="status">This video couldn’t load. <a href={id ? `https://www.youtube.com/watch?v=${id}` : mp4 || src}>Watch the original</a></p>{/if}
	</div>
	{#if !hero}<figcaption><a class="text-link" href={id ? `https://www.youtube.com/watch?v=${id}` : mp4 || src}>{title}</a></figcaption>{/if}
</figure>
