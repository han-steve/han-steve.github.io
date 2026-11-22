import { expect, test, type Page } from '@playwright/test';
import { freezeTransitions } from './helpers/view-transitions';

for (const path of ['/', '/cv/']) {
	test(`experience returns to its opener on ${path} and reopens with browser Forward`, async ({page}) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(path);
		const link = page.locator('a[href="/experience/roblox/"]').first();
		await link.scrollIntoViewIfNeeded();
		const scroll = await page.evaluate(() => scrollY);
		await link.focus();
		await page.keyboard.press('Enter');
		const dialog = page.getByRole('dialog', { name: 'Roblox', exact: true });
		await expect(dialog).toBeVisible();
		await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
		await expect(dialog.getByRole('link', { name: /Ray Summit/ })).toHaveCount(2);
		await page.keyboard.press('Escape');
		await expect(dialog).toHaveCount(0);
		await expect(link).toBeFocused();
		expect(await page.evaluate(() => scrollY)).toBe(scroll);
		await page.goForward();
		await expect(dialog).toBeVisible();
		await page.goBack();
		await expect(dialog).toHaveCount(0);
		await expect(link).toBeFocused();
	});
}

async function seek(page: Page, time: number) {
	await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition?.ready)).toBe(true);
	await page.evaluate(async ms => {
		for (const a of (window as any).__cornerTransition.animations) a.currentTime = ms;
		await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	}, time);
}

async function finish(page: Page) {
	await page.evaluate(() => (window as any).__cornerTransition.animations.forEach((a: Animation) => a.finish()));
	await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition.finished)).toBe(true);
}

async function frame(page: Page, key: string) {
	return page.evaluate(key => {
		function box(part: string) {
			const style = getComputedStyle(document.documentElement, `::view-transition-group(project-${key}-${part})`);
			const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
			const pair = getComputedStyle(document.documentElement, `::view-transition-image-pair(project-${key}-${part})`);
			const drop = parseFloat(pair.translate.split(' ')[1]) || 0;
			return { x: matrix.m41, y: matrix.m42 + drop, w: parseFloat(style.width), h: parseFloat(style.height), drop };
		}
		return { surface: box('surface'), art: box('art'), title: box('title') };
	}, key);
}

for (const [path, width] of [['/#experience-heading', 1440], ['/cv/', 390]] as const) {
	test(`experience rectangle carries the title and clips article text at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 930 });
		await freezeTransitions(page);
		await page.goto(path);
		const link = page.locator('a[data-project-surface="experience-orca"]').first();
		await link.scrollIntoViewIfNeeded();
		const row = (await link.boundingBox())!;
		// A unique ink color makes escaped body text detectable in an actual browser frame.
		await page.addStyleTag({ content: 'img { filter: grayscale(1); } .job section { color: #ff00dd !important; }' });
		await link.click();
		const panel = (await page.locator('.project-sheet').boundingBox())!;
		for (const direction of ['open', 'close']) {
			await expect(page.locator('html')).toHaveAttribute('data-project-transition', direction);
			const heights: number[] = [];
			for (const time of [0, 105, 260, 415, 520]) {
				await seek(page, time);
				const { surface, art, title } = await frame(page, 'experience-orca');
				heights.push(surface.h);
				const progress = direction === 'open' ? time : 520 - time;
				if (progress === 0 || progress === 520) {
					const end = progress === 0 ? row : panel;
					expect(surface.w).toBeCloseTo(end.width, 0);
					expect(surface.h).toBeCloseTo(end.height, 0);
					expect(surface.x).toBeCloseTo(end.x, 0);
					expect(surface.y).toBeCloseTo(end.y, 0);
				}
				expect(art.w).toBeCloseTo(art.h, 0);
				for (const part of [art, title]) {
					expect(part.x).toBeGreaterThanOrEqual(surface.x - 2);
					expect(part.y).toBeGreaterThanOrEqual(surface.y - 2);
					expect(part.x + part.w).toBeLessThanOrEqual(surface.x + surface.w + 2);
					expect(part.y + part.h).toBeLessThanOrEqual(surface.y + surface.h + 2);
				}
				const png = await page.screenshot();
				const ink = await page.evaluate(async ({ png, surface }) => {
					const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
					const canvas = document.createElement('canvas');
					canvas.width = bitmap.width; canvas.height = bitmap.height;
					const ctx = canvas.getContext('2d')!;
					ctx.drawImage(bitmap, 0, 0);
					const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
					let inside = 0, outside = 0;
					for (let i = 0; i < data.length; i += 4) {
						if (data[i] - data[i + 1] < 120 || data[i + 2] - data[i + 1] < 90) continue;
						const x = i / 4 % canvas.width, y = Math.floor(i / 4 / canvas.width);
						if (x < surface.x - 2 || x > surface.x + surface.w + 2 ||
							y < surface.y - 2 || y > surface.y + surface.h + 2) outside++;
						else inside++;
					}
					return { inside, outside };
				}, { png: png.toString('base64'), surface });
				expect(ink.outside).toBe(0);
				if (progress === 520) expect(ink.inside).toBeGreaterThan(100);
			}
			expect(heights).toEqual([...heights].sort((a,b) => direction === 'open' ? a-b : b-a));
			expect(new Set(heights).size).toBe(5);
			await finish(page);
			if (direction === 'open') {
				if (width > 760) await page.mouse.click(8, 120);
				else await page.keyboard.press('Escape');
			}
		}
		await expect(link).toBeFocused();
	});
}

for (const [path, selector, key] of [
	['/cv/', 'a[data-project-surface="experience-roblox"]', 'experience-roblox'],
	['/projects/', 'a[aria-label="Explore VoxCraft VR"]', 'voxcraft-vr']
]) {
	test('outside click slides the whole sheet down on ' + path, async ({ page }) => {
		await freezeTransitions(page);
		await page.goto(path);
		const link = page.locator(selector).first();
		await link.click();
		await seek(page, 520);
		await finish(page);
		const start = (await page.locator('.project-sheet').boundingBox())!;
		await page.mouse.click(8, 120);
		await expect(page.locator('html')).toHaveAttribute('data-project-transition', 'close');
		await seek(page, 125);
		const { surface, art } = await frame(page, key);
		expect(surface.drop).toBeGreaterThan(25);
		expect(surface.y).toBeGreaterThan(start.y + 10);
		expect(art.drop).toBeCloseTo(surface.drop, 1);
		await seek(page, 520);
		expect((await frame(page, key)).surface.drop).toBe(0);
		await finish(page);
		await expect(link).toBeFocused();
	});
}

test('mobile experience sheet follows a swipe and dismisses to the same scroll position', async ({page}) => {
	await page.setViewportSize({width: 390, height: 844});
	await page.emulateMedia({colorScheme: 'dark'});
	await page.goto('/#experience-heading');
	const link = page.locator('a.experience-row[href="/experience/dive-chat/"]');
	await link.scrollIntoViewIfNeeded();
	const position = await page.evaluate(() => scrollY);
	await link.click();
	const sheet = page.locator('.project-sheet');
	await expect(sheet).toBeVisible();
	await expect(sheet).not.toHaveClass(/transitioning/);
	const cdp = await page.context().newCDPSession(page);
	async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', y?: number) {
		await cdp.send('Input.dispatchTouchEvent', {type, touchPoints: y === undefined ? [] : [{x:195, y}]});
	}
	await touch('touchStart', 12);
	await touch('touchMove', 72);
	await expect(sheet).toHaveClass(/dragging/);
	const bounds = (await sheet.boundingBox())!;
	expect(bounds.y).toBeGreaterThan(15);
	expect(bounds.width).toBeLessThan(390);
	await page.screenshot({path:'qa/experience-sheet-mobile-drag.png'});
	await touch('touchMove', 210);
	await touch('touchEnd');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(link).toBeFocused();
	expect(await page.evaluate(() => scrollY)).toBe(position);
});

test('direct experience links prerender readable details and close to the CV', async ({page, request}) => {
	const url = '/experience/amazon/';
	const html = await (await request.get(url)).text();
	expect(html).toContain('<dialog open');
	expect(html).toContain('a mentorship app');
	await page.goto(url);
	await page.reload();
	const dialog = page.getByRole('dialog', {name: 'Amazon'});
	await expect(dialog.getByText('Over two summer internships', {exact: false})).toBeVisible();
	await dialog.getByRole('link', {name: 'Close experience'}).click();
	await expect(page).toHaveURL(/\/cv\/#experience-heading$/);
	await expect(page.getByRole('link', {name: /Download resume/})).toHaveAttribute('href','/Steve_Resume.pdf');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('two fast activations open one history entry', async ({page}) => {
	await page.goto('/#experience-heading');
	const link = page.locator('.experience-row[href="/experience/amazon/"]');
	await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
	const initial = await page.evaluate(() => history.length);
	await link.evaluate(el => { (el as HTMLAnchorElement).click(); (el as HTMLAnchorElement).click(); });
	await expect(page.getByRole('dialog', {name:'Amazon'})).toBeVisible();
	await expect(page.locator('.project-sheet')).not.toHaveClass(/transitioning/);
	expect(await page.evaluate(() => history.length)).toBe(initial + 1);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(link).toBeFocused();
});

test('a scrolled article closes as a clipped rectangle without lifting its hidden title', async ({ page }) => {
	await freezeTransitions(page);
	await page.goto('/cv/');
	const link = page.locator('a[data-project-surface="experience-roblox"]').first();
	await link.click();
	await seek(page, 520);
	await finish(page);
	await page.locator('.sheet-scroll').evaluate(el => el.scrollTop = 550);
	await page.mouse.click(8, 120);
	await expect(page.locator('html')).toHaveAttribute('data-project-transition', 'close');
	await seek(page, 155);
	const names = await page.evaluate(() => ((window as any).__cornerTransition.animations as Animation[])
		.map(a => (a.effect as KeyframeEffect).pseudoElement));
	expect(names).toContain('::view-transition-group(project-experience-roblox-surface)');
	expect(names).not.toContain('::view-transition-group(project-experience-roblox-title)');
	await finish(page);
	await expect(link).toBeFocused();
});

test('outside click slides down before dismissal without view transitions', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(document, 'startViewTransition', { value: undefined });
		const animate = Element.prototype.animate;
		Element.prototype.animate = function(...args) {
			const motion = animate.apply(this, args);
			if (this.matches('.project-sheet') && motion.effect!.getTiming().fill === 'forwards') {
				motion.pause();
				motion.currentTime = Number(motion.effect!.getTiming().duration) / 2;
				(window as any).exitMotion = motion;
			}
			return motion;
		};
	});
	await page.goto('/cv/');
	const link = page.locator('a[data-project-surface="experience-roblox"]').first();
	await link.click();
	const sheet = page.locator('.project-sheet');
	await expect(sheet).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	const start = (await sheet.boundingBox())!;
	await page.mouse.click(8, 120);
	await expect.poll(() => page.evaluate(() => Boolean((window as any).exitMotion))).toBe(true);
	expect((await sheet.boundingBox())!.y).toBeGreaterThan(start.y + 10);
	await page.evaluate(() => (window as any).exitMotion.finish());
	await expect(link).toBeFocused();
});
