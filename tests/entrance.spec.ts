import { test, expect, type Page } from '@playwright/test';

async function holdHydration(page: Page) {
	let release!: () => void;
	const held = new Promise<void>(resolve => { release = resolve; });
	await page.route('**/_app/immutable/**/*.js', async route => {
		await held;
		await route.continue().catch(() => {});
	});
	return release;
}

for (const colorScheme of ['light', 'dark'] as const) {
	test(`${colorScheme}: first paint stays blurred before and through delayed hydration`, async ({ page }) => {
		await page.emulateMedia({colorScheme, reducedMotion:'no-preference'});
		if (colorScheme === 'dark') await page.setViewportSize({width:390,height:844});
		const errors: string[] = [];
		page.on('pageerror', e => errors.push(e.message));
		page.on('console', message => { if (/hydration_mismatch|hydration_attribute_changed/.test(message.text())) errors.push(message.text()); });
		await page.addInitScript(() => {
			(window as any).entranceFrames = [];
			const sample = () => {
				const backdrop = document.querySelector('.entrance-backdrop');
				const identity = document.querySelector('.header-identity');
				if (backdrop && identity) {
					const style = getComputedStyle(backdrop);
					(window as any).entranceFrames.push({
						phase: document.documentElement.dataset.entrance,
						covered: style.display !== 'none' && Number(style.opacity) > .95 && style.backdropFilter !== 'none',
						identity: getComputedStyle(identity).visibility,
						opacity: style.display === 'none' ? 0 : Number(style.opacity)
					});
				}
				if (!(window as any).stopEntranceSampling) requestAnimationFrame(sample);
			};
			requestAnimationFrame(sample);
		});
		const release = await holdHydration(page);
		try {
			await page.goto('/', {waitUntil:'commit'});
			await page.locator('.header-identity').waitFor({state:'attached'});
			await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
			await page.screenshot({path:`qa/entrance-${colorScheme}-before-hydration.png`});
			await expect(page.locator('.entrance-backdrop')).toHaveCSS('display','block');
			await expect(page.locator('.entrance-backdrop')).toHaveCSS('backdrop-filter','blur(16px)');
			await expect(page.locator('.header-identity')).toHaveCSS('visibility','hidden');
			await expect(page.locator('html')).toHaveAttribute('data-entrance','pending');
			release();
			await expect(page.locator('html')).toHaveAttribute('data-entrance','running');
			await page.waitForTimeout(200);
			const frames = await page.evaluate(() => (window as any).entranceFrames);
			expect(frames.length).toBeGreaterThan(2);
			expect(frames.every((frame: any) => frame.covered)).toBe(true);
			expect(frames.filter((frame: any) => frame.phase === 'pending').every((frame: any) => frame.identity === 'hidden')).toBe(true);
			const identity = await page.locator('.header-identity').boundingBox();
			expect(Math.abs(identity!.y + identity!.height / 2 - page.viewportSize()!.height / 2)).toBeLessThan(2);
			await page.waitForTimeout(1500);
			await page.screenshot({path:`qa/entrance-${colorScheme}-running.png`});
			await expect(page.locator('.entrance-backdrop')).not.toHaveClass(/running/, {timeout:6000});
			await expect(page.locator('html')).not.toHaveAttribute('data-entrance');
			await expect(page.locator('.header-identity')).toHaveCSS('visibility','visible');
			await expect(page.locator('.header-identity')).toHaveCSS('transform','none');
			await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
			await page.evaluate(() => { (window as any).stopEntranceSampling = true; });
			const allFrames = await page.evaluate(() => (window as any).entranceFrames);
			// The blur must never flash back when its WAAPI animation finishes.
			expect(allFrames.every((frame: any, index: number) => index === 0 || frame.opacity <= allFrames[index - 1].opacity + .01)).toBe(true);
			expect(await page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
			expect(errors).toEqual([]);
		} finally { release(); }
	});
}

test('returning visits, reduced motion, blocked storage and deep links stay readable before hydration', async ({ browser }) => {
	for (const scenario of ['seen','reduced','storage','deep','anchor'] as const) {
		const context = await browser.newContext({reducedMotion:scenario==='reduced'?'reduce':'no-preference',baseURL:process.env.PREVIEW_URL || 'http://127.0.0.1:4178'});
		const page=await context.newPage();
		if (scenario==='seen') await page.addInitScript(() => localStorage.setItem('skipAnimation','TRUE'));
		if (scenario==='storage') await page.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable');}}));
		const release=await holdHydration(page);
		try {
			await page.goto(scenario==='deep'?'/cv/':scenario==='anchor'?'/#main':'/', {waitUntil:'commit'});
			await expect(page.locator('.header-identity')).toBeVisible();
			await expect(page.locator('.entrance-backdrop')).toHaveCSS('display','none');
			await expect(page.locator('html')).not.toHaveAttribute('data-entrance');
		} finally {release();await context.close();}
	}
});

test('failed or very late hydration releases the guard without replaying over the visible page', async ({ page }) => {
	await page.emulateMedia({reducedMotion:'no-preference'});
	await page.clock.install();
	const release=await holdHydration(page);
	try {
		await page.goto('/',{waitUntil:'commit'});
		await page.locator('.header-identity').waitFor({state:'attached'});
		await expect(page.locator('html')).toHaveAttribute('data-entrance','pending');
		await page.clock.fastForward(8100);
		await expect(page.locator('html')).not.toHaveAttribute('data-entrance');
		await expect(page.locator('.header-identity')).toBeVisible();
		await expect(page.locator('.entrance-backdrop')).toHaveCSS('display','none');
		release();
		// The static theme button is visible before its Svelte handler is attached.
		await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
		await page.getByRole('button',{name:'Switch to dark mode'}).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
		await expect(page.locator('.entrance-backdrop')).not.toHaveClass(/running/);
	} finally {release();}
});

test('reduced-motion change before hydration and no-JavaScript visits never remain masked', async ({ browser }) => {
	const context=await browser.newContext({reducedMotion:'no-preference',baseURL:process.env.PREVIEW_URL || 'http://127.0.0.1:4178'});
	const page=await context.newPage();
	const release=await holdHydration(page);
	try {
		await page.goto('/',{waitUntil:'commit'});
		await page.locator('.header-identity').waitFor({state:'attached'});
		await expect(page.locator('html')).toHaveAttribute('data-entrance','pending');
		await page.emulateMedia({reducedMotion:'reduce'});
		await expect(page.locator('.header-identity')).toBeVisible();
		await expect(page.locator('html')).not.toHaveAttribute('data-entrance');
	} finally {release();await context.close();}
	const plain=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.PREVIEW_URL || 'http://127.0.0.1:4178'});
	const document=await plain.newPage();
	await document.goto('/');
	await expect(document.getByRole('heading',{name:'Steve Han.',exact:true})).toBeVisible();
	await expect(document.locator('.entrance-backdrop')).toHaveCSS('display','none');
	await plain.close();
});
