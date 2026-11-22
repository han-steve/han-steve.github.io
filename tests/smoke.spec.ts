import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const paths = [
	'/',
	'/projects/',
	'/projects/trill/',
	'/projects/voxcraft-vr/',
	'/projects/self-steering-scooter/',
	'/projects/project-sunrise/',
	'/experience/roblox/',
	'/cv/'
];
for (const scheme of ['light', 'dark'] as const) {
	test(`${scheme}: every route renders without errors or broken assets`, async ({ page }) => {
		await mkdir('qa', { recursive: true });
		await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		for (const path of paths) {
			const response = await page.goto(path);
			expect(response?.status(), path).toBe(200);
			await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
			if (path === '/') {
				await expect(page.locator('.tech-icon')).toHaveCount(22);
				const missing = await page.locator('.tech-icon').evaluateAll(async icons => {
					const results = await Promise.all(icons.map(async icon => {
						const src = (icon as SVGImageElement).href.baseVal;
						const image = new Image(); image.src = src;
						try { await image.decode(); return null; } catch { return src; }
					}));
					return results.filter(Boolean);
				});
				expect(missing, 'technology SVG assets').toEqual([]);
			}
			const sheet = await page.locator('.sheet-scroll').count();
			if (sheet) await page.locator('.sheet-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; });
			else await page.locator('footer').last().scrollIntoViewIfNeeded();
			await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
			await expect
				.poll(
					() =>
						page
							.locator(sheet ? '.project-dialog img' : 'img')
							.evaluateAll((imgs) => imgs.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)),
					{ message: path + ' images' }
				)
				.toBeTruthy();
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
				path + ' overflow'
			).toBeTruthy();
			expect(await page.locator('html').getAttribute('data-theme')).toBe(scheme);
			const audit = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
				.analyze();
			expect(
				audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
				path
			).toEqual([]);
			await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.sheet-scroll')?.scrollTo(0, 0); });
			if (['/', '/projects/trill/', '/cv/'].includes(path))
				await page.screenshot({
					path: `qa/${scheme}-${path === '/' ? 'home' : path.split('/').filter(Boolean).join('-')}.png`,
					fullPage: !sheet
				});
		}
		expect(errors).toEqual([]);
	});
}

test('mobile: all pages fit at 320, 390 and 768 pixels', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 844 });
		for (const path of paths) {
			await page.goto(path);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
				`${width} ${path}`
			).toBeTruthy();
		}
		await page.goto('/');
		await page.locator('.bubble-chart').scrollIntoViewIfNeeded();
		await expect(page.locator('.node').first()).toHaveCSS('opacity', '1');
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.screenshot({ path: `qa/mobile-${width}-home.png`, fullPage: true });
		await page.goto('/projects/trill/');
		await page.screenshot({ path: `qa/mobile-${width}-trill.png`, fullPage: false });
	}
});
