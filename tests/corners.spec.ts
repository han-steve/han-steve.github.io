import { test, expect, type Page } from '@playwright/test';

import { freezeTransitions } from './helpers/view-transitions';

async function sampleCorners(page: Page, slug: string, label: string) {
	await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition?.ready)).toBe(true);
	for (const progress of [.12, .5, .88]) {
		const rect = await page.evaluate(async ({slug,progress}) => {
			const state = (window as any).__cornerTransition;
			state.animations.forEach((animation: Animation) => { animation.currentTime = 520 * progress; });
			await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
			const style = getComputedStyle(document.documentElement, `::view-transition-group(project-${slug}-art)`);
			const transform = new DOMMatrixReadOnly(style.transform);
			return {x:transform.m41,y:transform.m42,width:parseFloat(style.width),height:parseFloat(style.height)};
		}, {slug,progress});
		expect(rect.width).toBeGreaterThan(40);
		const png = await page.screenshot({path:`qa/corners-${label}-${progress}.png`});
		const pixels = await page.evaluate(async ({png,rect}) => {
			const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
			const canvas = document.createElement('canvas'); canvas.width=image.width; canvas.height=image.height;
			const context=canvas.getContext('2d')!; context.drawImage(image,0,0);
			const read=(x:number,y:number)=>[...context.getImageData(Math.round(x),Math.round(y),1,1).data].slice(0,3);
			return {
				center:read(rect.x+rect.width/2,rect.y+rect.height/2),
				corners:[[2,2],[rect.width-3,2],[2,rect.height-3],[rect.width-3,rect.height-3]].map(([x,y])=>read(rect.x+x,rect.y+y))
			};
		}, {png:png.toString('base64'),rect});
		const magenta=(rgb:number[])=>rgb[0]>150 && rgb[1]<80 && rgb[2]>150;
		expect(magenta(pixels.center),'the moving icon itself remains visible').toBe(true);
		expect(pixels.corners.some(magenta),`${label} at ${progress}: image pixels must not escape rounded corners`).toBe(false);
	}
	await page.evaluate(() => (window as any).__cornerTransition.animations.forEach((animation: Animation) => animation.finish()));
	await expect.poll(() => page.evaluate(() => (window as any).__cornerTransition.finished)).toBe(true);
}

for (const scenario of [
	{slug:'voxcraft-vr',title:'VoxCraft VR',asset:'voxcraft.png',scheme:'light',width:1440},
	{slug:'project-sunrise',title:'Project Sunrise',asset:'sunrise-hardware.png',scheme:'dark',width:390}
] as const) {
	test(`${scenario.scheme}: rounded project icon survives every opening and closing snapshot`, async ({page}) => {
		await page.setViewportSize({width:scenario.width,height:1000});
		await page.emulateMedia({colorScheme:scenario.scheme,reducedMotion:'no-preference'});
		await freezeTransitions(page);
		// A flat diagnostic texture makes escaping image corners measurable.
		await page.route(`**/assets/projects/${scenario.asset}`, route => route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><path fill="#f0f" d="M0 0h160v160H0z"/></svg>'}));
		await page.goto('/projects/');
		await expect.poll(() => page.evaluate(() => localStorage.getItem('skipAnimation'))).toBe('TRUE');
		await page.addStyleTag({content:'.site-shell[inert] .project-art, .project-hero { visibility: hidden; }'});
		const card=page.getByRole('link',{name:`Explore ${scenario.title}`,exact:true});
		await card.scrollIntoViewIfNeeded();
		await card.locator('img').evaluate(image=>(image as HTMLImageElement).decode());
		await card.click();
		await sampleCorners(page,scenario.slug,`${scenario.scheme}-open`);
		await page.getByRole('link',{name:'Close project',exact:true}).click();
		await sampleCorners(page,scenario.slug,`${scenario.scheme}-close`);
		await expect(card).toBeVisible();
	});
}
