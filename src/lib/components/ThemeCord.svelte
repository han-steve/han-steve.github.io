<script lang="ts">
	import { onDestroy } from 'svelte';
	let { dark, onpull }: { dark: boolean; onpull: () => void } = $props();
	let pull = $state(0);
	let held = $state(false);
	let pointer: number | null = null;
	let startY = 0;
	let startX = 0;
	let moved = false;
	let suppressClick = false;
	let releaseTimer: ReturnType<typeof setTimeout> | undefined;
	function release() { held = false; pull = 0; }
	function press(event: PointerEvent) {
		if (event.button !== 0 || pointer !== null) return;
		clearTimeout(releaseTimer);
		pointer = event.pointerId;
		startY = event.clientY; startX = event.clientX;
		moved = suppressClick = false;
		held = true;
		(event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
	}
	function move(event: PointerEvent) {
		if (event.pointerId !== pointer) return;
		const dy = event.clientY - startY;
		const dx = event.clientX - startX;
		moved ||= Math.abs(dy) > 6 || Math.abs(dx) > 6;
		pull = Math.max(0, Math.min(64, dy * .7));
	}
	function end(event: PointerEvent, cancelled = false) {
		if (event.pointerId !== pointer) return;
		pointer = null;
		suppressClick = moved || cancelled;
		if (!cancelled && pull >= 18 && Math.abs(event.clientX - startX) < 48) onpull();
		release();
	}
	function activate(event: MouseEvent) {
		if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
		suppressClick = false;
		onpull();
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		clearTimeout(releaseTimer);
		held = true; pull = 26;
		releaseTimer = setTimeout(release, 110);
	}
	onDestroy(() => clearTimeout(releaseTimer));
</script>

<button class="theme-cord" class:held style={`--cord-pull:${pull}px`}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark}
	title="Pull or click to change the lighting"
	onpointerdown={press} onpointermove={move} onpointerup={event => end(event)}
	onpointercancel={event => end(event, true)} onlostpointercapture={event => end(event, true)}
	onclick={activate}>
	<span class="cord-line" aria-hidden="true"></span>
	<span class="cord-handle" aria-hidden="true">
		{#if dark}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></svg>
		{:else}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.5 14A8.8 8.8 0 0 1 10 3.5 8.8 8.8 0 1 0 20.5 14Z" /></svg>
		{/if}
	</span>
</button>
