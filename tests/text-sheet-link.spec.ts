import { expect, test } from '@playwright/test';

for (const device of [
	{ name: 'desktop', viewport: { width: 1440, height: 960 }, touch: false },
	{ name: 'phone', viewport: { width: 390, height: 844 }, touch: true }
]) {
	test.describe(device.name, () => {
		test.use({ viewport: device.viewport, hasTouch: device.touch, isMobile: device.touch });

		test('the CV project link opens and closes TRILL without a transition', async ({ page }) => {
			await page.emulateMedia({ reducedMotion: 'no-preference' });
			await page.addInitScript(() => {
				const motion = { snapshots: 0, entrances: 0 };
				const start = document.startViewTransition?.bind(document);
				if (start) {
					document.startViewTransition = (update) => {
						motion.snapshots++;
						return start(update);
					};
				}
				const animate = Element.prototype.animate;
				Element.prototype.animate = function (...args) {
					if (this.matches('.project-sheet')) motion.entrances++;
					return animate.apply(this, args);
				};
				Object.defineProperty(window, 'sheetMotionForTest', { value: motion });
			});
			await page.goto('/cv/');
			await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');

			const thesis = page.getByRole('link', { name: 'VR Teleoperation Interface for Learning Loco-manipulation of Humanoid Robots' });
			await expect(thesis).toHaveAttribute('href', 'https://doi.org/10.26153/tsw/52390');
			const project = page.getByRole('link', { name: 'TRILL', exact: true });
			const dialog = page.getByRole('dialog', { name: 'TRILL', exact: true });
			await project.scrollIntoViewIfNeeded();
			const scroll = await page.evaluate(() => scrollY);
			await page.getByRole('main').evaluate(el => el.setAttribute('data-cv-before-open', 'true'));
			if (device.touch) await project.tap();
			else await project.press('Enter');
			await expect(page).toHaveURL(/\/projects\/trill\/$/);
			await expect(dialog).toBeVisible();
			await expect(page.locator('main')).toHaveAttribute('data-cv-before-open', 'true');

			await dialog.getByRole('link', { name: 'Close project' }).click();
			await expect(page).toHaveURL(/\/cv\/$/);
			await expect(project).toBeFocused();
			expect(await page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);

			await page.goForward();
			await expect(dialog).toBeVisible();
			await page.goBack();
			await expect(dialog).toHaveCount(0);
			await expect(project).toBeFocused();
			expect(await page.evaluate(() => Reflect.get(window, 'sheetMotionForTest'))).toEqual({
				snapshots: 0, entrances: 0
			});

			await page.goto('/projects/trill/');
			await expect(page.locator('dialog:modal')).toBeVisible();
			expect(await page.evaluate(() => Reflect.get(window, 'sheetMotionForTest'))).toEqual({
				snapshots: 0, entrances: 0
			});
		});
	});
}
