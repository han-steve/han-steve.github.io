import { test, expect, type Browser, type Page } from '@playwright/test';
import { freezeTransitions } from './helpers/view-transitions';

const previewURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4178';

type TouchType = 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel';

async function settle(page: Page) {
	await expect(page.locator('.video-frame')).not.toHaveClass(/transitioning/);
	await expect.poll(() => page.locator('.project-sheet').evaluate(element => element.getAnimations().length)).toBe(0);
}

async function mobileSheet(browser: Browser, frozen = false) {
	const context = await browser.newContext({
		viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
		reducedMotion: 'no-preference', colorScheme: 'dark', baseURL: previewURL
	});
	const page = await context.newPage();
	if (frozen) await freezeTransitions(page);
	const cdp = await context.newCDPSession(page);
	const touch = async (type: TouchType, y?: number) => {
		await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: y === undefined ? [] : [{ x: 195, y }] });
		await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(null))));
	};
	await page.goto('/projects/');
	const card = page.getByRole('link', { name: 'Explore TRILL', exact: true });
	await card.scrollIntoViewIfNeeded();
	const source = (await card.locator('.project-art').boundingBox())!;
	const scrollY = await page.evaluate(() => window.scrollY);
	await card.click();
	await expect(page.getByRole('dialog')).toBeVisible();
	if (frozen) {
		await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition?.ready)).toBe(true);
		await page.evaluate(() => (window as any).__cornerTransition.animations.forEach((animation: Animation) => animation.finish()));
		await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition.finished)).toBe(true);
	}
	await settle(page);
	return { context, page, card, source, scrollY, touch };
}

// Measure the visible dimming, whether implemented with background alpha or opacity.
async function backdropAlpha(page: Page) {
	return page.locator('.sheet-backdrop').evaluate(element => {
		const style = getComputedStyle(element);
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 1;
		const context = canvas.getContext('2d')!;
		context.fillStyle = style.backgroundColor;
		context.fillRect(0, 0, 1, 1);
		return context.getImageData(0, 0, 1, 1).data[3] / 255 * Number(style.opacity);
	});
}

test('route focus never outlines the page while keyboard controls retain a visible indicator', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
	await page.goto('/cv/');
	const experience = page.getByRole('region', { name: 'Experience', exact: true });
	const html = await (await page.request.get('/cv/')).text();
	expect(html).toContain('experience-heading');
	for (const [company, url] of [
		['Roblox', '/experience/roblox/'],
		['Amazon', '/experience/amazon/'],
		['Orca', '/experience/orca/'],
		['Dive Chat', '/experience/dive-chat/']
	]) {
		await expect(experience.getByRole('link', { name: new RegExp(`^${company}`) })).toHaveAttribute('href', url);
		expect(html).toContain(company);
	}
	await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'PROJECTS', exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/$/);
	await expect(page.locator('body')).toHaveCSS('outline-style', 'none');
	// Exercise structural focus under keyboard modality as well as ordinary routing.
	await page.keyboard.press('Tab');
	await page.evaluate(() => {
		document.body.tabIndex = -1;
		document.body.focus({ preventScroll: true });
	});
	await expect(page.locator('body')).toBeFocused();
	await expect(page.locator('body')).toHaveCSS('outline-style', 'none');
	const control = page.getByRole('button', { name: 'Robotics & ML', exact: true });
	await control.focus();
	await expect(control).toBeFocused();
	const indicator = await control.evaluate(element => {
		const style = getComputedStyle(element);
		return {
			keyboard: element.matches(':focus-visible'),
			visible: (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none'
		};
	});
	expect(indicator).toEqual({ keyboard: true, visible: true });
	await page.screenshot({ path: 'qa/refinement-dark-focus.png' });
});

test('mobile handle remains usable when scrolled and cancelled pulls settle the sheet and backdrop together', async ({ browser }) => {
	const { context, page, touch, scrollY } = await mobileSheet(browser);
	try {
		const scrollOffset = await page.locator('.sheet-scroll').evaluate(element => {
			element.scrollTop = 400;
			return element.scrollTop;
		});
		expect(scrollOffset).toBeGreaterThan(0);
		const initial = (await page.locator('.project-sheet').boundingBox())!;
		const restingVeil = await backdropAlpha(page);
		await touch('touchStart', 10);
		for (const y of [40, 75, 120]) await touch('touchMove', y);
		const pulled = (await page.locator('.project-sheet').boundingBox())!;
		expect(pulled.y).toBeGreaterThan(initial.y + 30);
		expect(pulled.width).toBeLessThan(initial.width - 10);
		expect(await backdropAlpha(page)).toBeLessThan(restingVeil - .02);
		expect(await page.locator('.sheet-scroll').evaluate(element => element.scrollTop)).toBe(scrollOffset);
		await page.screenshot({ path: 'qa/refinement-mobile-handle-pulled.png' });
		await touch('touchCancel');
		await expect(page.getByRole('dialog')).toBeVisible();
		// The veil should still be settling on the first frame, rather than snapping dark.
		expect(await backdropAlpha(page)).toBeLessThan(restingVeil - .005);
		await expect(page.locator('.project-sheet')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
		await expect.poll(() => backdropAlpha(page)).toBeCloseTo(restingVeil, 2);
		expect(await page.locator('.sheet-scroll').evaluate(element => element.scrollTop)).toBe(scrollOffset);
		await touch('touchStart', 10);
		for (const y of [60, 120, 190, 260]) await touch('touchMove', y);
		await touch('touchEnd');
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(page).toHaveURL(/\/projects\/$/);
		expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
	} finally { await context.close(); }
});

test('reversing a pull or holding a short pull cancels instead of using stale downward velocity', async ({ browser }) => {
	const { context, page, touch } = await mobileSheet(browser);
	try {
		await touch('touchStart', 100);
		await touch('touchMove', 260);
		await touch('touchMove', 180);
		await touch('touchEnd');
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.locator('.project-sheet')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
		await touch('touchStart', 100);
		await touch('touchMove', 220);
		// No intervening movement: an old fast sample must expire before release.
		await page.waitForTimeout(240);
		await touch('touchEnd');
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.locator('.project-sheet')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
		await page.screenshot({ path: 'qa/refinement-mobile-cancelled.png' });
	} finally { await context.close(); }
});

test('accepted mobile swipe reverses from its dragged geometry into the originating tile', async ({ browser }) => {
	const { context, page, card, source, scrollY, touch } = await mobileSheet(browser, true);
	try {
		// Hold the poster steady so a blank surface cannot masquerade as a fluid return.
		await page.addStyleTag({content:'.media-player { visibility:hidden !important; } .media-poster { opacity:1 !important; transition:none !important; }'});
		await page.locator('.media-poster').evaluate((image: HTMLImageElement) => image.decode());
		await touch('touchStart', 100);
		for (const y of [140, 190, 250, 310]) await touch('touchMove', y);
		const dragged = (await page.locator('.project-sheet').boundingBox())!;
		const hero = (await page.locator('.project-hero').boundingBox())!;
		const before = await page.screenshot();
		await page.evaluate(() => { (window as any).__cornerTransition = null; });
		await touch('touchEnd');
		await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition?.ready)).toBe(true);
		const sample = async (fraction: number) => page.evaluate(async fraction => {
			const state = (window as any).__cornerTransition;
			state.animations.forEach((animation: Animation) => {
				animation.currentTime = Number(animation.effect!.getComputedTiming().endTime) * fraction;
			});
			await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
			const style = getComputedStyle(document.documentElement, '::view-transition-group(project-trill-surface)');
			const matrix = new DOMMatrixReadOnly(style.transform);
			const width = parseFloat(style.width), height = parseFloat(style.height);
			const [originX = 0, originY = 0, originZ = 0] = style.transformOrigin.split(/\s+/).map((value, axis) =>
				value.endsWith('%') ? parseFloat(value) / 100 * (axis === 0 ? width : height) : parseFloat(value)
			);
			// CSS applies the matrix about transform-origin, not necessarily the top-left.
			const projection = new DOMMatrix().translate(originX, originY, originZ).multiply(matrix).translate(-originX, -originY, -originZ);
			const corners = [[0, 0], [width, 0], [0, height], [width, height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(projection));
			const x = Math.min(...corners.map(point => point.x));
			const y = Math.min(...corners.map(point => point.y));
			return { x, y, width: Math.max(...corners.map(point => point.x)) - x };
		}, fraction);
		const first = await sample(0);
		expect(Math.abs(first.width - dragged.width)).toBeLessThan(3);
		expect(Math.abs(first.x - dragged.x)).toBeLessThan(3);
		expect(Math.abs(first.y - dragged.y)).toBeLessThan(3);
		const after = await page.screenshot({path:'qa/refinement-mobile-return-start.png'});
		const heroDifference = await page.evaluate(async ({before,after,hero}) => {
			const pixels = async (png: string) => {
				const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
				const canvas = document.createElement('canvas'); canvas.width=image.width; canvas.height=image.height;
				const context=canvas.getContext('2d')!; context.drawImage(image,0,0); return context;
			};
			const [a,b] = await Promise.all([pixels(before),pixels(after)]);
			return Math.max(...[.35,.5,.65].flatMap(y => [.25,.6,.9].map(x => {
				const px=Math.round(hero.x+hero.width*x), py=Math.round(hero.y+hero.height*y);
				const old=a.getImageData(px,py,1,1).data, next=b.getImageData(px,py,1,1).data;
				return Math.max(...[0,1,2].map(channel=>Math.abs(old[channel]-next[channel])));
			})));
		}, {before:before.toString('base64'),after:after.toString('base64'),hero});
		expect(heroDifference, 'the hero must remain visible when the reverse snapshot begins').toBeLessThan(25);
		await sample(.5);
		await page.screenshot({ path: 'qa/refinement-mobile-return.png' });
		const last = await sample(.97);
		expect(last.width).toBeLessThan(first.width / 2);
		expect(Math.abs(last.width - source.width)).toBeLessThan(Math.abs(first.width - source.width) * .15);
		await page.evaluate(() => (window as any).__cornerTransition.animations.forEach((animation: Animation) => animation.finish()));
		await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition.finished)).toBe(true);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(card).toBeInViewport();
		expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
	} finally { await context.close(); }
});
