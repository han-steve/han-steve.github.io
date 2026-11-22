import type { Page } from '@playwright/test';

export async function freezeTransitions(page: Page) {
	await page.addInitScript(() => {
		const start = document.startViewTransition.bind(document);
		document.startViewTransition = ((update: any) => {
			const state = { ready: false, finished: false, animations: [] as Animation[] };
			(window as any).__cornerTransition = state;
			const transition = start(update);
			void transition.ready.then(() => {
				state.animations = document.getAnimations().filter(animation => (animation.effect as KeyframeEffect)?.pseudoElement?.startsWith('::view-transition'));
				state.animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
				state.ready = true;
			});
			void transition.finished.then(() => { state.finished = true; });
			return transition;
		}) as typeof document.startViewTransition;
	});
}
