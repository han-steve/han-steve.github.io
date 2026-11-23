import { test, expect } from '@playwright/test';

test('tab lettering rides the fading ribbon through the drop and rebound while the page follows', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/projects/');
	await page.evaluate(() => {
		(window as any).samples = [];
		const start = performance.now();
		const sample = () => {
			const ribbon = document.querySelector('nav a[href^="/cv"] .tab-ribbon')!;
			const tab = ribbon.closest('a')!;
			const label = tab.querySelector('.tab-label')!;
			const ink = document.createRange();
			ink.selectNodeContents(label);
			const rest = document.createRange();
			rest.selectNodeContents(tab.querySelector('.tab-idle')!);
			const main = document.querySelector('main')!;
			(window as any).samples.push({
				ribbonY: ribbon.getBoundingClientRect().y,
				offset: new DOMMatrix(getComputedStyle(ribbon).transform).m42,
				labelOffset: ink.getBoundingClientRect().y - rest.getBoundingClientRect().y,
				fade: Number(getComputedStyle(ribbon).opacity),
				opacity: Number(getComputedStyle(main).opacity),
				mainY: new DOMMatrix(getComputedStyle(main).transform).m42
			});
			if (performance.now() - start < 1000) requestAnimationFrame(sample);
		};
		requestAnimationFrame(sample);
	});
	await page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('CV');
	await expect(page.locator('main')).toHaveCSS('opacity', '1');
	await expect(page.locator('.route.selected .tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	const samples = await page.evaluate(() => (window as any).samples);
	expect(Math.max(...samples.map((s: any) => s.ribbonY)) - Math.min(...samples.map((s: any) => s.ribbonY))).toBeGreaterThan(160);
	expect(samples.every((s: any) => Math.abs(s.labelOffset - s.offset) < .1)).toBe(true);
	expect(samples.every((s: any) => Math.abs(s.fade - Math.max(0, Math.min(1, 1 + s.offset / 170))) < .02)).toBe(true);
	expect(samples.some((s: any) => s.opacity > .1 && s.opacity < .9 && s.mainY > 1)).toBe(true);
	expect(samples.some((s: any) => s.offset < -80)).toBe(true);
	expect(samples.some((s: any) => s.offset > 3)).toBe(true);
	await page.evaluate(() => {
		(document.querySelector('nav a[href^="/projects"]') as HTMLElement).click();
		setTimeout(() => (document.querySelector('nav a[href^="/cv"]') as HTMLElement).click(), 50);
	});
	await expect(page).toHaveURL(/\/cv\/$/);
	await expect(page.locator('main')).toHaveCSS('opacity', '1');
	await expect(page.locator('main')).toHaveCSS('transform', 'none');
	await expect(page.locator('.route.selected')).toHaveAccessibleName('CV');
	const projectsTab = page.getByRole('navigation').getByRole('link', { name: 'PROJECTS', exact: true });
	await projectsTab.hover();
	await expect(projectsTab.locator('.tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -170)');
	await projectsTab.click();
	await expect(page).toHaveURL(/\/projects\/$/);
	await expect(projectsTab.locator('.tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await expect(page.locator('.route.selected .tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

for (const touch of [false, true]) {
	test(`visible tabs preload before ${touch ? 'touch' : 'keyboard'} navigation`, async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: touch ? 390 : 1280, height: 850 },
			hasTouch: touch,
			isMobile: touch,
			reducedMotion: 'reduce'
		});
		try {
			const page = await context.newPage();
			await page.goto('/');
			const nav = page.getByRole('navigation', { name: 'Main navigation' });
			await expect(nav).toBeInViewport();
			await page.waitForLoadState('networkidle');
			// Both destinations must render from modules fetched before the first interaction.
			await context.setOffline(true);
			for (const title of ['Projects', 'CV', 'Projects']) {
				const tab = nav.getByRole('link', { name: title.toUpperCase(), exact: true });
				if (touch) await tab.tap();
				else await tab.press('Enter');
				await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
				await expect(tab).toHaveAttribute('aria-current', 'page');
			}
		} finally {
			await context.close();
		}
	});
}

test('with Data Saver a mobile tab pulls immediately while the route loads', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
	let release!: () => void;
	const gate = new Promise<void>(resolve => { release = resolve; });
	try {
		await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
		const page = await context.newPage();
		await page.goto('/projects/');
		await page.waitForLoadState('networkidle');
		const routeModule = /\/_app\/immutable\/nodes\/[^/]+\.js$/;
		await page.route(routeModule, async route => { await gate; await route.continue(); });
		const tab = page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true });
		const pending = page.waitForRequest(routeModule);
		// Pause just the two tug animations at their lowest point on creation.
		// Releasing the network gate must still allow SvelteKit to render CV.
		await page.evaluate(() => {
			document.addEventListener('transitionrun', event => {
				const el = event.target as HTMLElement;
				if (event.propertyName !== 'transform' || !el.matches('.route.selected .tab-ribbon')) return;
				for (const transition of el.getAnimations()) {
					transition.pause();
					transition.currentTime = 165;
				}
			});
			const animate = Element.prototype.animate;
			Element.prototype.animate = function (...args) {
				const animation = animate.apply(this, args);
				if (this.matches('main')) {
					animation.pause();
					animation.currentTime = 250;
				}
				return animation;
			};
		});
		await tab.tap();
		await pending;
		const down = 'matrix(1, 0, 0, 1, 0, 10)';
		await expect.poll(() => tab.locator('.tab-ribbon').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m42)).toBeGreaterThan(3);
		await expect(tab).toHaveClass(/selected/);
		await expect(tab.locator('.tab-ribbon')).toHaveCSS('opacity', '1');
		await expect(page.locator('main')).toHaveCSS('transform', down);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
		await page.screenshot({ path: 'qa/nav-mobile-tug.png' });
		release();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('CV');
		await expect(page.locator('main')).toHaveCSS('transform', down);
		await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'paused').forEach(a => a.play()));
		await expect(page.locator('main')).toHaveCSS('transform', 'none');
		await expect(tab.locator('.tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	} finally {
		release();
		await context.close();
	}
});

test('project sheet preserves the real page, scroll, keyboard focus and browser history', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const errors: string[] = [];
	page.on('pageerror', e => errors.push(e.message));
	await page.goto('/projects/');
	const card = page.getByRole('link', { name: 'Explore Project Sunrise', exact: true });
	await card.scrollIntoViewIfNeeded();
	await page.locator('main').evaluate(el => el.setAttribute('data-preserved', 'yes'));
	const position = await page.evaluate(() => scrollY);
	await card.click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.locator('.site-shell')).toHaveAttribute('inert', '');
	await page.keyboard.press('Tab');
	expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
	await page.locator('.sheet-scroll').evaluate(el => { el.scrollTop = 500; });
	expect(await page.evaluate(() => scrollY)).toBe(position);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL(/\/projects\/$/);
	await expect(card).toBeFocused();
	await expect(page.locator('main')).toHaveAttribute('data-preserved', 'yes');
	expect(await page.evaluate(() => scrollY)).toBe(position);
	await page.goForward();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.goBack();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(card).toBeFocused();
	await card.click();
	await page.locator('.next-project').click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('TRILL');
	await page.getByRole('link', { name: 'Close project', exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/$/);
	await card.click();
	await page.mouse.click(20, 250);
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(card).toBeFocused();
	expect(errors).toEqual([]);
});

test('mobile pull-down tracks the finger, cancels short pulls and dismisses to the same page', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference', baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4178' });
	const page = await context.newPage();
	const errors: string[] = [];
	page.on('pageerror', error => errors.push(error.message));
	const cdp = await context.newCDPSession(page);
	const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', y?: number) => {
		await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: y === undefined ? [] : [{ x: 195, y }] });
		await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(null))));
	};
	await page.goto('/projects/');
	await page.getByRole('link', { name: 'Explore TRILL', exact: true }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.locator('.video-frame')).not.toHaveClass(/transitioning/);
	await expect.poll(() => page.locator('.project-sheet').evaluate(el => el.getAnimations().length)).toBe(0);
	const position = await page.evaluate(() => scrollY);
	const initial = await page.locator('.project-sheet').boundingBox();
	await touch('touchStart', 100);
	await touch('touchMove', 125);
	await touch('touchEnd');
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.locator('.project-sheet')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await page.locator('.sheet-scroll').evaluate(el => { el.scrollTop = 400; });
	await touch('touchStart', 300);
	await touch('touchMove', 450);
	await touch('touchEnd');
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.locator('.sheet-scroll').evaluate(el => { el.scrollTop = 0; });
	await touch('touchStart', 100);
	for (const y of [130, 170, 210, 260, 300]) await touch('touchMove', y);
	const pulled = await page.locator('.project-sheet').boundingBox();
	expect(pulled!.width).toBeLessThan(initial!.width - 20);
	expect(pulled!.y).toBeGreaterThan(100);
	await page.screenshot({ path: 'qa/sheet-mobile-pull.png' });
	await touch('touchEnd');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL(/\/projects\/$/);
	expect(await page.evaluate(() => scrollY)).toBe(position);
	await expect(page.getByRole('link', { name: 'Explore TRILL', exact: true })).toBeInViewport();
	expect(errors).toEqual([]);
	await context.close();
});

test('the scrolled toolbar blurs the article, leaves space around the close control and clears over the cover', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
	await page.goto('/projects/self-steering-scooter/');
	const sheet = page.locator('.project-sheet');
	const scroll = page.locator('.sheet-scroll');
	const grip = page.locator('.sheet-handle span');
	await expect(sheet).not.toHaveClass(/sheet-with-toolbar/);
	await scroll.evaluate(el => {
		el.scrollTop = el.querySelector<HTMLElement>('.case-body')!.offsetTop;
	});
	await expect(sheet).toHaveClass(/sheet-with-toolbar/);
	await expect(grip).toHaveCSS('background-color', 'rgb(23, 23, 23)');
	const layers = await grip.evaluate(el => {
		const grip = el.getBoundingClientRect();
		const sheet = el.closest('.project-sheet')!;
		const bar = getComputedStyle(sheet, '::before');
		const button = sheet.querySelector('.sheet-close')!;
		const close = button.getBoundingClientRect();
		const disc = getComputedStyle(button, '::before');
		const top = close.top - sheet.getBoundingClientRect().top;
		const bottom = parseFloat(bar.height) - top - close.height;
		return {
			blur: bar.backdropFilter,
			isTranslucent: bar.backgroundColor.includes('0.72'),
			top: top + parseFloat(disc.top), bottom: bottom + parseFloat(disc.bottom),
			discSize: parseFloat(disc.height), targetSize: close.height,
			belowGrip: document.elementFromPoint(grip.right + 70, grip.y)?.classList.contains('project-sheet'),
			gripIsOnTop: document.elementFromPoint(grip.x + grip.width / 2, grip.y + 2) === el
		};
	});
	expect(layers).toEqual({ blur: 'blur(16px)', isTranslucent: true, top: 10, bottom: 10, discSize: 28, targetSize: 44, belowGrip: true, gripIsOnTop: true });
	await scroll.evaluate(el => { el.scrollTop = 0; });
	await expect(sheet).not.toHaveClass(/sheet-with-toolbar/);
	await expect(grip).toHaveCSS('backdrop-filter', /invert\(1\)/);
});

test('direct project reload closes to the archive and the Sunrise cover uses the original hardware photo', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/projects/project-sunrise/');
	await page.reload();
	await expect(page.locator('.media-poster')).toHaveAttribute('src', '/assets/projects/sunrise-hardware.png');
	await page.getByRole('link', { name: 'Close project', exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/$/);
	await expect(page.getByRole('link', { name: 'Explore Project Sunrise', exact: true }).locator('img')).toHaveAttribute('src', '/assets/projects/sunrise-hardware.png');
	await expect(page.getByRole('link', { name: 'Explore Ray at Roblox', exact: true })).toHaveCount(0);
	await page.goto('/projects/ray-at-roblox/');
	await expect(page).toHaveURL(/\/experience\/roblox\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Roblox');
	await page.goto('/');
	await expect(page.getByRole('link', { name: /Ray Summit/ })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Blog' })).toHaveCount(0);
	await expect(page.locator('a[href^="/blog"], link[href="/feed.xml"]')).toHaveCount(0);
	await expect(page.locator('a[href*="youtube.com/watch"]')).toHaveCount(0);
	await page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true }).click();
	await page.getByRole('link', { name: 'Roblox', exact: true }).click();
	await expect(page).toHaveURL(/\/experience\/roblox\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Roblox');
	await expect(page.getByRole('link', { name: /Ray Summit/ })).toHaveCount(2);
	await expect(page.locator('.job section h2').first()).toHaveText('Agent infrastructure');
	const ray = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Batch inference and training on Ray' }) });
	const safety = page.locator('section').filter({ has: page.getByRole('heading', { name: 'GPU inference clusters' }) });
	await expect(ray.getByRole('link', { name: 'Running AI Inference at Scale in the Hybrid Cloud' })).toHaveAttribute('href', /about\.roblox\.com\/newsroom\/2024\/09\//);
	await expect(safety.locator('a[href^="https://about.roblox.com/newsroom/"]')).toHaveCount(2);
});
