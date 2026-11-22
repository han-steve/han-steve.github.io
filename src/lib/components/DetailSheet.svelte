<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { dismissSheet, fallbackPath, rememberSheetFocus, restoreSheetFocus, shallowPath, sheetKey, type SheetDetail } from '$lib/sheet-navigation';
	import { navigationTransitionActive } from '$lib/stores';
	import ProjectDetail from './ProjectDetail.svelte';
	import ExperienceDetail from './ExperienceDetail.svelte';
	let { detail }: { detail: SheetDetail } = $props();
	const key = $derived(sheetKey(detail));
	const title = $derived(detail.kind === 'project' ? detail.item.title : detail.item.company);
	let dialog: HTMLDialogElement;
	let backdrop: HTMLDivElement;
	let sheet: HTMLDivElement;
	let scroll: HTMLDivElement;
	let handle: HTMLDivElement;
	let drag = $state(0);
	let dragging = $state(false);
	let coverCleared = $state(false);
	let closing = false;
	async function dismiss(reason: 'control' | 'gesture' | 'outside' = 'control') {
		if (closing) return;
		closing = true;
		// Native snapshots start at the finger's current position and return to the tile.
		const outside = reason === 'outside';
		const moveOnDismiss = outside || (reason === 'gesture' && !$page.state.skipSheetMotion);
		const hasMorph = typeof document.startViewTransition === 'function' && !$page.state.skipSheetMotion;
		if (moveOnDismiss && !hasMorph && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
			backdrop.animate([{ opacity: getComputedStyle(backdrop).opacity }, { opacity: 0 }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
			await sheet.animate([
				{ transform: getComputedStyle(sheet).transform, opacity: 1 },
				{ transform: `translateY(${drag + 80}px) scale(.9)`, opacity: 0 }
			], { duration: 180, easing: 'ease-in', fill: 'forwards' }).finished;
		}
		await dismissSheet(detail.kind, outside);
	}

	onMount(() => {
		rememberSheetFocus();
		const previousOverflow = document.body.style.overflow;
		const previousPadding = document.body.style.paddingRight;
		const scrollbarWidth = innerWidth - document.documentElement.clientWidth;
		const previousTitle = document.title;
		const sheetTitle = `${title} — Steve Han`;
		if (scrollbarWidth > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
		document.body.style.overflow = 'hidden';
		document.title = sheetTitle;
		if (dialog.open) dialog.close();
		dialog.showModal();
		dialog.focus({ preventScroll: true });
		const cover = scroll.querySelector('.project-hero');
		coverCleared = !cover;
		const coverObserver = cover && new IntersectionObserver(([entry]) => {
			coverCleared = !entry.isIntersecting;
		}, {
			root: scroll,
			rootMargin: `-${getComputedStyle(sheet).getPropertyValue('--sheet-controls-height').trim()} 0px 0px`
		});
		if (cover) coverObserver?.observe(cover);
		if (shallowPath($page.state) && !$page.state.skipSheetMotion && !$navigationTransitionActive && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const timing = { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' };
			backdrop.animate([{ opacity: 0 }, { opacity: 1 }], timing);
			sheet.animate([{ opacity: 0, transform: 'translateY(32px) scale(.97)' }, { opacity: 1, transform: 'none' }], timing);
		}
		let startX = 0, startY = 0, lastY = 0, lastMoved = 0, velocity = 0, candidate = false;
		const start = (x: number, y: number, target: EventTarget | null) => {
			if (closing || $navigationTransitionActive) { candidate = false; return; }
			const element = target as Element;
			const fromHandle = !!element?.closest('.sheet-handle');
			candidate = (fromHandle || scroll.scrollTop <= 1) && !element?.closest('a, button, input, iframe, video[controls]');
			startX = x; startY = lastY = y; lastMoved = performance.now(); velocity = 0;
		};
		const move = (x: number, y: number, event: Event) => {
			if (!candidate || closing) return;
			const dy = y - startY, dx = x - startX;
			if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { candidate = false; return; }
			if (dy < 0 && !dragging) { candidate = false; return; }
			if (dy > 6 || dragging) {
				event.preventDefault();
				const now = performance.now(), elapsed = Math.max(1, now - lastMoved);
				const recent = (y - lastY) * .72 / elapsed;
				velocity = elapsed > 100 || velocity * recent <= 0 ? recent : velocity * .35 + recent * .65;
				lastY = y; lastMoved = now;
				dragging = true;
				const distance = Math.max(0, dy * .72);
				drag = Math.min(320, distance <= 180 ? distance : 180 + Math.sqrt(distance - 180) * 4);
			}
		};
		const end = (cancelled = false) => {
			candidate = false;
			if (!dragging || closing) return;
			const recentVelocity = performance.now() - lastMoved > 100 ? 0 : velocity;
			if (!cancelled && (drag > 100 || (drag > 45 && recentVelocity > .55))) {
				// Keep tracking styles and geometry until the old snapshot is captured.
				void dismiss('gesture');
			} else {
				dragging = false;
				drag = 0;
			}
		};
		const touchStart = (event: TouchEvent) => {
			if (event.touches.length !== 1) { end(true); return; }
			start(event.touches[0].clientX, event.touches[0].clientY, event.target);
		};
		const touchMove = (event: TouchEvent) => {
			if (event.touches.length !== 1) { end(true); return; }
			move(event.touches[0].clientX, event.touches[0].clientY, event);
		};
		const touchEnd = () => end();
		const cancel = () => end(true);
		const mouseStart = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse' || event.button !== 0) return;
			handle.setPointerCapture(event.pointerId);
			start(event.clientX, event.clientY, event.target);
		};
		const mouseMove = (event: PointerEvent) => { if (event.pointerType === 'mouse') move(event.clientX, event.clientY, event); };
		const mouseEnd = (event: PointerEvent) => { if (event.pointerType === 'mouse') end(); };
		const mouseCancel = (event: PointerEvent) => { if (event.pointerType === 'mouse') end(true); };
		const outside = (event: MouseEvent) => { if (event.target === dialog) void dismiss('outside'); };
		sheet.addEventListener('touchstart', touchStart, { passive: true });
		sheet.addEventListener('touchmove', touchMove, { passive: false });
		sheet.addEventListener('touchend', touchEnd);
		sheet.addEventListener('touchcancel', cancel);
		handle.addEventListener('pointerdown', mouseStart);
		handle.addEventListener('pointermove', mouseMove);
		handle.addEventListener('pointerup', mouseEnd);
		handle.addEventListener('pointercancel', cancel);
		handle.addEventListener('lostpointercapture', mouseCancel);
		dialog.addEventListener('click', outside);
		return () => {
			coverObserver?.disconnect();
			dialog.close();
			queueMicrotask(restoreSheetFocus);
			document.body.style.overflow = previousOverflow;
			document.body.style.paddingRight = previousPadding;
			if (document.title === sheetTitle) document.title = previousTitle;
			sheet.removeEventListener('touchstart', touchStart);
			sheet.removeEventListener('touchmove', touchMove);
			sheet.removeEventListener('touchend', touchEnd);
			sheet.removeEventListener('touchcancel', cancel);
			handle.removeEventListener('pointerdown', mouseStart);
			handle.removeEventListener('pointermove', mouseMove);
			handle.removeEventListener('pointerup', mouseEnd);
			handle.removeEventListener('pointercancel', cancel);
			handle.removeEventListener('lostpointercapture', mouseCancel);
			dialog.removeEventListener('click', outside);
		};
	});
</script>

<div class="sheet-backdrop" class:dragging bind:this={backdrop} aria-hidden="true"
	style={`--dismiss-progress:${Math.min(drag / 400, .8)}`}></div>
<dialog open class="project-dialog" aria-labelledby={detail.kind + '-title'} tabindex="-1" bind:this={dialog}
	oncancel={event => { event.preventDefault(); void dismiss(); }}>
	<div class="project-sheet" class:dragging class:transitioning={$navigationTransitionActive}
		class:sheet-with-toolbar={detail.kind === 'experience' || coverCleared} bind:this={sheet}
		data-project-surface={key} style:view-transition-name={`project-${key}-surface`}
		style={`--sheet-drag:${drag}px;--sheet-scale:${1 - Math.min(drag / 1100, .16)}`}>
		<div class="sheet-handle" bind:this={handle} aria-hidden="true"><span></span></div>
		<a class="sheet-close" href={$page.state.returnTo || fallbackPath(detail.kind)} aria-label={'Close ' + detail.kind}
			onclick={event => { event.preventDefault(); void dismiss(); }}>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
		</a>
		<div class="sheet-scroll" bind:this={scroll}>
			{#if detail.kind === 'project'}
				<ProjectDetail project={detail.item} />
			{:else}
				<ExperienceDetail job={detail.item} />
			{/if}
		</div>
	</div>
</dialog>
