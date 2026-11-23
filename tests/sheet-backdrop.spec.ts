import { expect, test, type Page } from '@playwright/test';
import { freezeTransitions } from './helpers/view-transitions';

// Measure stripe contrast outside the sheet. Dimming alone leaves this ratio unchanged.
async function contrast(page: Page) {
	const image = await page.screenshot();
	return page.evaluate(async base64 => {
		const pixels = await createImageBitmap(await (await fetch('data:image/png;base64,' + base64)).blob());
		const canvas = document.createElement('canvas');
		canvas.width = pixels.width;
		canvas.height = pixels.height;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(pixels, 0, 0);
		const { data } = ctx.getImageData(36, 36, 48, 1);
		const red = Array.from(data).filter((_, index) => index % 4 === 0);
		const min = Math.min(...red), max = Math.max(...red);
		return (max - min) / Math.max(1, max + min);
	}, image.toString('base64'));
}

async function sample(page: Page, time: number) {
	await page.evaluate(async ms => {
		for (const animation of (window as any).__cornerTransition.animations) animation.currentTime = ms;
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	}, time);
	return contrast(page);
}

async function finish(page: Page) {
	await page.evaluate(() => (window as any).__cornerTransition.animations.forEach((a: Animation) => a.finish()));
	await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition.finished)).toBe(true);
}

for (const [path, selector] of [
	['/cv/', 'a[data-project-surface="experience-roblox"]'],
	['/projects/', 'a[aria-label="Explore VoxCraft VR"]']
]) {
	test('background blurs during both sheet transitions from ' + path, async ({ page }) => {
		await freezeTransitions(page);
		await page.goto(path);
		await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
		await page.addStyleTag({ content: `.site-shell::before {
			content: ''; position: fixed; inset: 0 auto auto 0; width: 120px; height: 80px;
			background: repeating-linear-gradient(90deg, black 0 4px, white 4px 8px);
		}` });
		const opener = page.locator(selector).first();
		await opener.scrollIntoViewIfNeeded();
		expect(await contrast(page)).toBeGreaterThan(.95);
		await opener.click();
		for (const direction of ['open', 'close']) {
			await expect(page.locator('html')).toHaveAttribute('data-project-transition', direction);
			await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition?.ready)).toBe(true);
			const first = await sample(page, 0);
			const early = await sample(page, direction === 'open' ? 20 : 65);
			const late = await sample(page, 270);
			await finish(page);
			const settled = await contrast(page);
			if (direction === 'open') {
				expect(first).toBeGreaterThan(.95);
				expect(early).toBeLessThan(first - .08);
				expect(early).toBeGreaterThan(late + .025);
				expect(late).toBeLessThan(.07);
				expect(Math.abs(settled - late)).toBeLessThan(.04);
				await page.keyboard.press('Escape');
			} else {
				expect(first).toBeLessThan(.07);
				expect(early).toBeGreaterThan(first + .08);
				expect(early).toBeLessThan(late - .025);
				expect(late).toBeGreaterThan(.95);
				expect(Math.abs(settled - late)).toBeLessThan(.04);
			}
		}
	});
}

test('the fallback starts the backdrop and sheet on the same animation frame', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(document, 'startViewTransition', { value: undefined });
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (...args) {
			const animation = animate.apply(this, args);
			if (this.matches('.sheet-backdrop, .project-sheet')) {
				(window as any).sheetAnimations ??= [];
				(window as any).sheetAnimations.push(animation);
			}
			return animation;
		};
	});
	await page.goto('/cv/');
	await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
	await page.locator('a[data-project-surface="experience-roblox"]').first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	const timings = await page.evaluate(async () => {
		const animations: Animation[] = (window as any).sheetAnimations;
		await Promise.all(animations.map(animation => animation.ready));
		return animations.map(a => ({ start: a.startTime, duration: a.effect!.getTiming().duration }));
	});
	expect(timings).toHaveLength(2);
	expect(timings[0].start).not.toBeNull();
	expect(timings[0]).toEqual(timings[1]);
});
