import { test, expect } from '@playwright/test';

test('lamp cord supports click, keyboard, drag and cancellation without double toggling', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
	await page.goto('/projects/');
	const cord = page.locator('.theme-cord');
	const handle = page.locator('.cord-handle');
	const line = await page.locator('.cord-line').boundingBox();
	expect(Math.abs(line!.y)).toBeLessThan(1);
	await cord.click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await cord.focus();
	await page.keyboard.press('Space');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	const knob = await handle.boundingBox();
	const x = knob!.x + knob!.width / 2, y = knob!.y + knob!.height / 2;
	await page.mouse.move(x, y); await page.mouse.down();
	await page.mouse.move(x, y + 50, { steps: 5 });
	expect((await handle.boundingBox())!.y).toBeGreaterThan(knob!.y + 25);
	await page.mouse.up();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.mouse.move(x, y); await page.mouse.down();
	await page.mouse.move(x - 80, y + 45, { steps: 5 }); await page.mouse.up();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await cord.focus(); await page.keyboard.press('Enter');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('mobile theme pull tracks touch, ignores a short pull and returns to rest', async ({ browser }) => {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'light', reducedMotion: 'no-preference', baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4178' });
	const page = await context.newPage();
	await page.goto('/projects/');
	const handle = page.locator('.cord-handle');
	const box = await handle.boundingBox();
	const x = box!.x + box!.width / 2, y = box!.y + box!.height / 2;
	const cdp = await context.newCDPSession(page);
	const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel', offset?: number) => {
		await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: offset === undefined ? [] : [{x, y: y + offset}] });
		await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(null))));
	};
	await touch('touchStart', 0); await touch('touchMove', 12); await touch('touchEnd');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await touch('touchStart', 0);
	for (const offset of [10, 25, 40, 55]) await touch('touchMove', offset);
	expect((await handle.boundingBox())!.y).toBeGreaterThan(box!.y + 30);
	await page.screenshot({path: 'qa/lamp-mobile-pulled.png'});
	await touch('touchEnd');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await touch('touchStart', 0); await touch('touchMove', 40); await touch('touchCancel');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(handle).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
	await context.close();
});

test('project artwork stays beside its title while video uses an independent full-width stage', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
	await page.goto('/projects/');
	const tab = page.locator('.route.selected');
	expect(await tab.locator('.tab-ribbon').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('255, 255, 255');
	await expect(tab.locator('.tab-label')).toHaveCSS('color', 'rgb(24, 24, 27)');
	const card = page.getByRole('link', { name: 'Explore TRILL', exact: true });
	await card.hover();
	await expect(card).not.toHaveCSS('box-shadow', 'none');
	await expect(card.locator('h3')).toHaveCSS('text-decoration-line', 'none');
	await card.click();
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({width, height: 900});
		// A resize acknowledgement can precede its layout frame. Sample all three
		// rectangles together so we never compare desktop and phone frames.
		await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
		const {logo,title,video} = await page.evaluate(() => ({
			logo: document.querySelector('.project-title-art')!.getBoundingClientRect().toJSON(),
			title: document.querySelector('#project-title')!.getBoundingClientRect().toJSON(),
			video: document.querySelector('.project-hero')!.getBoundingClientRect().toJSON()
		}));
		expect(logo!.x + logo!.width).toBeLessThan(title!.x);
		expect(logo!.y).toBeLessThan(video!.y + video!.height);
		expect(logo!.y + logo!.height).toBeGreaterThan(video!.y + video!.height);
		expect(Math.abs(video!.width / video!.height - 16 / 9)).toBeLessThan(.01);
		await expect(page.locator('.project-title-art img')).toHaveAttribute('src', '/assets/projects/trill.png');
		await expect(page.locator('.media-poster')).toHaveAttribute('src', '/assets/video/trill-ramen-poster.jpg');
		await expect(page.locator('.media-poster')).toHaveCSS('view-transition-name', 'none');
	}
});


test('quiet circles, circular focus and raised theme handle stay clear in both themes', async ({ page }) => {
 for (const colorScheme of ['light', 'dark'] as const) {
  await page.emulateMedia({reducedMotion:'reduce',colorScheme});
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.goto('/');
   const circle=page.getByRole('button',{name:'AWS',exact:true});
   await page.locator('.bubble-chart').scrollIntoViewIfNeeded();
   await expect(circle).toHaveCSS('opacity','1');
   await expect(circle.locator('circle')).toHaveAttribute('fill','#1a1a1a');
   await expect(circle.locator('.tech-icon')).toHaveCSS('filter','none');
   const knob=await page.locator('.cord-handle').boundingBox();
   const cv=await page.locator('.route[href="/cv/"] .tab-idle').evaluate(el=>{
    const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return {y:r.y,height:r.height};
   });
   expect(Math.abs(knob!.y+knob!.height/2-cv.y-cv.height/2)).toBeLessThan(8);
   await circle.scrollIntoViewIfNeeded();await circle.focus();await page.keyboard.press('Enter');
   await expect(circle).toHaveAttribute('aria-pressed','true');
   await expect(circle).toHaveCSS('outline-style','none');
   await expect(circle.locator('.name-text')).toHaveCSS('fill','rgb(255, 255, 255)');
   await page.screenshot({path:`qa/quiet-${colorScheme}-${width}-expanded.png`});
   await page.keyboard.press('Escape');
  }
 }
 await page.goto('/projects/self-steering-scooter/');
 await expect(page.locator('.project-title-art img')).toHaveAttribute('src','/assets/projects/scooter-model.png');
 await expect(page.locator('.media-poster')).toHaveAttribute('src','/assets/projects/scooter-opening.jpg');
 const alpha=await page.locator('.project-title-art img').evaluate(async element=>{
  const image=element as HTMLImageElement;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const context=canvas.getContext('2d')!;context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
  let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)visible++;
  return {corner:pixels[3],fraction:visible/(canvas.width*canvas.height)};
 });
 expect(alpha.corner).toBe(0);expect(alpha.fraction).toBeGreaterThan(.04);expect(alpha.fraction).toBeLessThan(.5);
});
