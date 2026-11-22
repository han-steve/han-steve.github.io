import { goto, pushState, replaceState } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { tick } from 'svelte';
import { experience, type ExperienceItem } from '$lib/experience';
import { projects, type Project } from '$lib/projects';
import { navigationTransitionActive, projectTransitionSlug } from '$lib/stores';

export type SheetDetail = { kind: 'project'; item: Project } | { kind: 'experience'; item: ExperienceItem };

export function detailAt(path?: string): SheetDetail | undefined {
	const match = /^\/(projects|experience)\/([^/]+)\/?$/.exec(path || '');
	if (!match) return;
	if (match[1] === 'projects') {
		const item = projects.find(p => p.slug === match[2]);
		if (item) return { kind: 'project', item };
	} else {
		const item = experience.find(job => job.slug === match[2]);
		if (item) return { kind: 'experience', item };
	}
}

export function shallowPath(state: App.PageState) {
	// The previous project-only history entries can still be visited with Back and Forward.
	return state.detailPath || (state.projectSlug && `/projects/${state.projectSlug}/`);
}

export function isSheetRoute(id?: string | null) {
	return id === '/projects/[slug]' || id === '/experience/[slug]';
}

export function sheetKey(detail: SheetDetail) {
	return detail.kind === 'project' ? detail.item.slug : `experience-${detail.item.slug}`;
}

export function fallbackPath(kind: SheetDetail['kind']) {
	return kind === 'experience' ? '/cv/#experience-heading' : '/projects/';
}

// Pair the row, company mark and title with the same parts in the sheet.
export function experienceSurface(link: HTMLAnchorElement) {
	const detail = detailAt(link.pathname);
	if (!detail) return;
	const key = sheetKey(detail);
	link.dataset.projectSurface = key;
	const unsubscribe = projectTransitionSlug.subscribe(active => {
		for (const part of ['surface', 'art', 'title']) {
			link.style.setProperty(`--experience-${part}`, active === key ? `project-${key}-${part}` : 'none');
		}
	});
	return { destroy: unsubscribe };
}

let activeTransition: ViewTransition | undefined;
let transitionGeneration = 0;
let returnFocus: HTMLAnchorElement | undefined;

export function rememberSheetFocus() {
	const current = get(page);
	if (isSheetRoute(current.route.id)) return;
	const path = current.state.originDetailPath ||
		(current.state.originProjectSlug && `/projects/${current.state.originProjectSlug}/`) || shallowPath(current.state);
	if (!path) return;
	const samePath = (link: HTMLAnchorElement) => link.pathname.replace(/\/?$/, '/') === path;
	if (returnFocus?.isConnected && samePath(returnFocus)) return;
	returnFocus = [...document.querySelectorAll<HTMLAnchorElement>('.site-shell a[href]')].find(samePath);
}

export function restoreSheetFocus() {
	if (returnFocus?.isConnected && !returnFocus.closest('[inert]')) {
		returnFocus.focus({ preventScroll: true });
		returnFocus = undefined;
	}
}

function surfaceGeometry(key?: string) {
	if (!key) return;
	const surface = [...document.querySelectorAll<HTMLElement>('[data-project-surface]')].find(element =>
		element.dataset.projectSurface === key && getComputedStyle(element).viewTransitionName === `project-${key}-surface`
	);
	if (!surface) return;
	const box = surface.classList.contains('project-tile-surface') ? surface.parentElement! : surface;
	const art = box.querySelector('.project-icon, .company-mark');
	return { radius: getComputedStyle(box).borderRadius, rect: box.getBoundingClientRect(), art: art && getComputedStyle(art).viewTransitionName !== 'none' ? art.getBoundingClientRect() : undefined };
}

// Reveal the full-size sheet around the same landmark as its traveling icon.
function cropAnchor(fromLength: number, toLength: number, fromCenter: number, toCenter: number) {
	if (Math.abs(toLength - fromLength) < 1) return '50%';
	const fraction = (toCenter - fromCenter) / (toLength - fromLength);
	return Math.max(0, Math.min(1, fraction)) * 100 + '%';
}

export async function sheetTransition(update: () => void | Promise<void>, target?: SheetDetail, skipMotion?: boolean) {
	const generation = ++transitionGeneration;
	activeTransition?.skipTransition();
	activeTransition = undefined;
	const current = get(page);
	const previous = detailAt(shallowPath(current.state) || current.url.pathname);
	const detail = target || previous;
	const key = detail && sheetKey(detail);
	const root = document.documentElement;
	function reset() {
		navigationTransitionActive.set(false);
		projectTransitionSlug.set(null);
		root.style.removeProperty('--project-radius-from');
		root.style.removeProperty('--project-radius-to');
		root.style.removeProperty('--project-crop');
		delete root.dataset.projectTransition;
		delete root.dataset.sheetKind;
		delete root.dataset.sheetOutside;
		delete root.dataset.scrolledExperience;
	}
	if ((skipMotion ?? current.state.skipSheetMotion) || !document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
		reset();
		await update();
		return;
	}
	navigationTransitionActive.set(true);
	projectTransitionSlug.set(key || null);
	await tick();
	root.dataset.projectTransition = previous ? (sheetKey(previous) === key ? 'close' : 'swap') : 'open';
	if (detail) root.dataset.sheetKind = detail.kind;
	// A scrolled-away header belongs inside the clipped snapshot during dismissal.
	const scroll = document.querySelector('.project-dialog .sheet-scroll');
	root.toggleAttribute('data-scrolled-experience', previous?.kind === 'experience' && !!scroll?.scrollTop);
	const from = surfaceGeometry(key);
	root.style.setProperty('--project-radius-from', from?.radius ?? '0px');
	try {
		const transition = document.startViewTransition(async () => {
			await update();
			await tick();
			const to = surfaceGeometry(key);
			root.style.setProperty('--project-radius-to', to?.radius ?? '0px');
			if (from?.art && to?.art) {
				const x = cropAnchor(from.rect.width, to.rect.width,
					from.art.left - from.rect.left + from.art.width / 2,
					to.art.left - to.rect.left + to.art.width / 2);
				const y = cropAnchor(from.rect.height, to.rect.height,
					from.art.top - from.rect.top + from.art.height / 2,
					to.art.top - to.rect.top + to.art.height / 2);
				root.style.setProperty('--project-crop', x + ' ' + y);
			}
		});
		activeTransition = transition;
		await transition.finished;
	} finally {
		if (generation === transitionGeneration) {
			activeTransition = undefined;
			reset();
		}
	}
}

export function interceptSheetLink(event: MouseEvent) {
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
	if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.origin !== location.origin || anchor.hash || anchor.search) return;
	const target = detailAt(anchor.pathname);
	const current = get(page);
	if (!target || isSheetRoute(current.route.id)) return;
	event.preventDefault();
	const path = anchor.pathname.replace(/\/?$/, '/');
	const openerSurface = anchor.dataset.projectSurface ??
		anchor.querySelector<HTMLElement>('[data-project-surface]')?.dataset.projectSurface;
	const skipSheetMotion = openerSurface !== sheetKey(target);
	void sheetTransition(() => {
		// A second click may arrive before the first snapshot updates browser history.
		const stateBeforeOpen = get(page).state;
		const previousPath = shallowPath(stateBeforeOpen);
		if (previousPath === path) return;
		if (!previousPath) returnFocus = anchor;
		const state = {
			detailPath: path,
			originDetailPath: stateBeforeOpen.originDetailPath || (stateBeforeOpen.originProjectSlug && `/projects/${stateBeforeOpen.originProjectSlug}/`) || previousPath || path,
			returnTo: stateBeforeOpen.returnTo || location.pathname + location.search + location.hash,
			skipSheetMotion
		};
		if (previousPath) replaceState(path, state);
		else pushState(path, state);
	}, target, skipSheetMotion);
}

export async function dismissSheet(kind: SheetDetail['kind'], outside = false) {
	document.documentElement.toggleAttribute('data-sheet-outside', outside);
	const current = get(page);
	if (shallowPath(current.state) && !isSheetRoute(current.route.id)) {
		await sheetTransition(() => new Promise<void>(resolve => {
			const unsubscribe = page.subscribe(next => {
				if (!shallowPath(next.state)) { queueMicrotask(unsubscribe); resolve(); }
			});
			history.back();
		}));
	} else {
		await goto(fallbackPath(kind), { replaceState: true, noScroll: kind === 'project' });
	}
	restoreSheetFocus();
}
