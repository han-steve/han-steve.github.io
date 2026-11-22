import { test, expect } from '@playwright/test';

for (const { width, scheme } of [
	{ width: 1100, scheme: 'light' },
	{ width: 390, scheme: 'dark' }
] as const) {
	test(`tab lettering travels with the fading ribbon inside the top edge at ${width}px`, async ({ page }, testInfo) => {
		await page.setViewportSize({ width, height: 850 });
		await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'no-preference' });
		await page.goto('/projects/');
		await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
		const nav = page.getByRole('navigation');
		const projects = nav.getByRole('link', { name: 'PROJECTS', exact: true });
		const bounds = (await projects.boundingBox())!;
		const aboveTab = {
			x: Math.floor(bounds.x + bounds.width / 2) - 2, y: Math.floor(bounds.y) - 6,
			width: 4, height: 5
		};
		const glow = await page.screenshot({ clip: aboveTab });
		const shadowOff = await page.addStyleTag({ content: '.tab-track { filter: none !important; }' });
		expect(await page.screenshot({ clip: aboveTab })).not.toEqual(glow);
		await shadowOff.evaluate(node => node.parentNode?.removeChild(node));

		const cv = nav.getByRole('link', { name: 'CV', exact: true });
		await page.evaluate(() => {
			document.addEventListener('transitionrun', event => {
				const target = event.target;
				if (!(target instanceof Element) || !target.matches('.tab-ribbon, .tab-idle')) return;
				for (const animation of target.getAnimations()) {
					animation.pause();
					animation.currentTime = 33;
				}
			});
		});
		await cv.click();
		await expect.poll(() => nav.locator('.tab-ribbon').evaluateAll(ribbons =>
			ribbons.flatMap(el => el.getAnimations()).filter(a => a.playState === 'paused').length
		)).toBe(4);
		const tabs = await nav.locator('a').evaluateAll(links => links.filter(link =>
			!!link.querySelector('.tab-ribbon')?.getAnimations().length
		).map(link => {
			const ribbon = link.querySelector('.tab-ribbon')!;
			const label = link.querySelector('.tab-label')!;
			const idle = link.querySelector('.tab-idle')!;
			const ink = document.createRange();
			ink.selectNodeContents(label);
			const rest = document.createRange();
			rest.selectNodeContents(idle);
			const rect = link.getBoundingClientRect();
			return {
				x: rect.x, y: rect.y, width: rect.width, height: rect.height,
				idle: idle.textContent, title: label.textContent,
				inkOffset: ink.getBoundingClientRect().y - rest.getBoundingClientRect().y,
				idleClip: parseFloat(getComputedStyle(idle).clipPath.slice('inset('.length)),
				opacity: Number(getComputedStyle(ribbon).opacity),
				offset: new DOMMatrix(getComputedStyle(ribbon).transform).m42
			};
		}));
		expect(tabs).toHaveLength(2);
		for (const tab of tabs) {
			expect(tab.idle).toBe(tab.title);
			await expect(nav.getByRole('link', { name: tab.title!, exact: true })).toHaveCount(1);
			expect(tab.inkOffset).toBeCloseTo(tab.offset, 1);
			expect(tab.idleClip).toBeCloseTo(tab.height + tab.offset, 1);
			expect(tab.opacity).toBeGreaterThan(.1);
			expect(tab.opacity).toBeLessThan(.9);
			expect(tab.opacity).toBeCloseTo(1 + tab.offset / 170, 2);
		}

		const rect = (await nav.boundingBox())!;
		const x = Math.floor(rect.x);
		const y = Math.floor(rect.y);
		const clip = { x, y: 0, width: Math.ceil(rect.x + rect.width) - x, height: y + 145 };
		await page.screenshot({ clip, path: testInfo.outputPath('mid-pull.png') });
		// The glow can cross the top edge. Compare just the painted ribbon and lettering.
		await page.addStyleTag({ content: '.tab-track { filter: none !important; }' });
		const frame = await page.screenshot({ clip });
		await page.addStyleTag({ content: '.tab-track { visibility: hidden; }' });
		const reference = await page.screenshot({ clip });

		const changed = await page.evaluate(async ({ frame, reference, clip, tabs }) => {
			async function pixels(png: string) {
				const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
				const canvas = document.createElement('canvas');
				canvas.width = bitmap.width;
				canvas.height = bitmap.height;
				const context = canvas.getContext('2d')!;
				context.drawImage(bitmap, 0, 0);
				return context.getImageData(0, 0, canvas.width, canvas.height).data;
			}
			const [a, b] = await Promise.all([pixels(frame), pixels(reference)]);
			return tabs.map(tab => {
				let above = 0, inside = 0;
				for (let y = 0; y < tab.y + tab.height; y++) {
					for (let x = Math.ceil(tab.x); x < Math.floor(tab.x + tab.width); x++) {
						const i = (y * clip.width + x - clip.x) * 4;
						if (a[i] === b[i] && a[i+1] === b[i+1] && a[i+2] === b[i+2]) continue;
						if (y < Math.floor(tab.y)) above++;
						else inside++;
					}
				}
				return { above, inside };
			});
		}, { frame: frame.toString('base64'), reference: reference.toString('base64'), clip, tabs });
		for (const region of changed) {
			expect(region.above).toBe(0);
			expect(region.inside).toBeGreaterThan(100);
		}
	});
}

test('pulling the selected tab lowers the lettering and fill together and returns them to rest', async ({ page }, testInfo) => {
	await page.goto('/cv/');
	await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
	const cv = page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true });
	const ribbon = cv.locator('.tab-ribbon');
	const position = () => ribbon.evaluate(el => {
		const text = document.createRange();
		text.selectNodeContents(el.querySelector('.tab-label')!);
		return { ink: text.getBoundingClientRect().y, fill: el.getBoundingClientRect().y };
	});
	const resting = await position();
	await cv.hover();
	expect(await position()).toEqual(resting);
	await cv.evaluate(link => {
		link.addEventListener('click', () => requestAnimationFrame(() => {
			const pull = link.querySelector('.tab-ribbon')!.getAnimations().find(a => !(a instanceof CSSTransition));
			if (pull) {
				pull.pause();
				pull.currentTime = 148.5;
			}
		}), { once: true });
	});
	await cv.focus();
	await page.keyboard.press('Enter');
	await expect.poll(() => ribbon.evaluate(el => el.getAnimations().some(a => a.playState === 'paused'))).toBe(true);
	const lowered = await position();
	expect(lowered.ink - resting.ink).toBeCloseTo(14);
	expect(lowered.fill - resting.fill).toBeCloseTo(14);
	await cv.screenshot({ path: testInfo.outputPath('selected-tug.png') });
	await ribbon.evaluate(el => el.getAnimations().forEach(a => a.play()));
	await expect.poll(position).toEqual(resting);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await cv.click();
	expect(await position()).toEqual(resting);
	expect(await ribbon.evaluate(el => el.getAnimations().length)).toBe(0);
});
