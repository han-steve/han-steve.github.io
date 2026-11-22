import { test, expect, chromium } from '@playwright/test';
import { freezeTransitions } from './helpers/view-transitions';

test('normal scrollbars do not create horizontal scrolling, including expanded bubbles and sheets', async () => {
	const browser=await chromium.launch({ignoreDefaultArgs:['--hide-scrollbars'],args:['--disable-features=OverlayScrollbar']});
	try {
		const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce',baseURL:process.env.PREVIEW_URL || 'http://127.0.0.1:4178'});
		await page.goto('/');
		await expect.poll(()=>page.evaluate(()=>localStorage.getItem('skipAnimation'))).toBe('TRUE');
		expect(await page.evaluate(()=>innerWidth-document.documentElement.clientWidth)).toBeGreaterThan(0);
		await page.locator('.bubble-chart').scrollIntoViewIfNeeded();
		await expect(page.locator('.node').first()).toHaveCSS('opacity','1');
		await page.getByRole('button',{name:'AWS',exact:true}).click();
		await expect(page.getByRole('button',{name:'AWS',exact:true})).toHaveAttribute('aria-pressed','true');
		await expect(page.getByRole('button',{name:'AWS',exact:true})).toHaveCSS('outline-style','none');
		const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
		expect(await overflow()).toBeLessThanOrEqual(0);
		await page.screenshot({path:'qa/surface-classic-scrollbars.png'});
		for(const path of ['/projects/','/projects/trill/','/projects/voxcraft-vr/','/projects/project-sunrise/']) {
			await page.goto(path);
			expect(await overflow(),path).toBeLessThanOrEqual(0);
			if(await page.locator('.sheet-scroll').count()) {
				expect(await page.locator('.sheet-scroll').evaluate(el=>el.scrollWidth-el.clientWidth),path).toBeLessThanOrEqual(0);
			}
		}
	} finally {await browser.close();}
});

for(const scenario of [{scheme:'light',width:1440},{scheme:'dark',width:390}] as const) {
	test(`${scenario.scheme}: tile background grows into the modal while its icon travels independently`, async ({page})=>{
		await page.setViewportSize({width:scenario.width,height:1000});
		await page.emulateMedia({colorScheme:scenario.scheme,reducedMotion:'no-preference'});
		await freezeTransitions(page);
		await page.goto('/projects/');
		await expect.poll(()=>page.evaluate(()=>localStorage.getItem('skipAnimation'))).toBe('TRUE');
		const card=page.getByRole('link',{name:'Explore TRILL',exact:true});
		const source=(await card.locator('.project-art').boundingBox())!;
		await card.click();
		await expect.poll(()=>page.evaluate(()=>(window as any).__cornerTransition?.ready)).toBe(true);
		const frames=[];
		for(const progress of [.02,.4,.85]) {
			frames.push(await page.evaluate(async progress=>{
				(window as any).__cornerTransition.animations.forEach((animation:Animation)=>{animation.currentTime=progress*520});
				await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(null))));
				const read=(name:string)=>{const s=getComputedStyle(document.documentElement,`::view-transition-group(project-trill-${name})`);return {width:parseFloat(s.width),height:parseFloat(s.height)};};
				const opacity=Number(getComputedStyle(document.documentElement,'::view-transition-new(project-trill-surface)').opacity);
				const image = getComputedStyle(document.documentElement,'::view-transition-new(project-trill-surface)');
				return {surface:read('surface'),icon:read('art'),opacity,fit:image.objectFit};
			},progress));
			await page.screenshot({path:`qa/surface-${scenario.scheme}-${progress}.png`});
		}
		const target=(await page.locator('.project-sheet').boundingBox())!;
		expect(frames[0].surface.width).toBeGreaterThan(source.width);
		expect(frames[1].surface.width).toBeGreaterThan(frames[0].surface.width);
		expect(frames[2].surface.width).toBeGreaterThan(frames[1].surface.width);
		expect(Math.abs(frames[2].surface.width-target.width)).toBeLessThan(8);
		expect(frames.every(frame=>frame.icon.width<=100 && frame.icon.height<=100)).toBe(true);
		expect(frames.every(frame => frame.fit === 'none')).toBe(true);
		expect(frames[0].opacity).toBe(0);
		expect(frames[2].opacity).toBe(1);
		const participants=await page.evaluate(()=>document.getAnimations().map(animation=>(animation.effect as KeyframeEffect)?.pseudoElement).filter(name=>name?.includes('project-')));
		expect(participants.every(name=>name!.includes('project-trill-'))).toBe(true);
		await page.evaluate(()=>(window as any).__cornerTransition.animations.forEach((animation:Animation)=>animation.finish()));
		await expect.poll(()=>page.evaluate(()=>(window as any).__cornerTransition.finished)).toBe(true);
		const rects=await page.evaluate(()=>({
			icon:document.querySelector('.project-title-art')!.getBoundingClientRect().toJSON(),
			video:document.querySelector('.project-hero')!.getBoundingClientRect().toJSON(),
			controls:document.querySelector('.hero-video .media-actions')!.getBoundingClientRect().toJSON()
		}));
		expect(rects.controls.bottom).toBeLessThanOrEqual(rects.icon.y);
		expect(rects.icon.y).toBeLessThan(rects.video.bottom);
		expect(rects.icon.bottom).toBeGreaterThan(rects.video.bottom);
		await expect(page.locator('.hero-video figcaption')).toHaveCount(0);
		await page.locator('.next-project').scrollIntoViewIfNeeded();
		await page.locator('.next-project').hover();
		const next=await page.evaluate(()=>({
			button:document.querySelector('.next-project')!.getBoundingClientRect().toJSON(),
			article:document.querySelector('.case-study')!.getBoundingClientRect().toJSON()
		}));
		expect(next.button.height).toBeLessThan(150);
		expect(next.article.bottom-next.button.bottom).toBeGreaterThanOrEqual(35);
		await page.screenshot({path:`qa/surface-${scenario.scheme}-next.png`});
	});
}

test('hackathon entries label their Devpost links and keep the main filters focused', async ({page})=>{
	await page.emulateMedia({reducedMotion:'reduce'});
	await page.goto('/projects/');
	await expect(page.locator('.project-row')).toHaveCount(4);
	const archive = page.getByRole('region', { name: 'Hackathons' });
	await expect(archive.getByRole('link', { name: /Devpost/ })).toHaveCount(4);
	for(const [title,slug] of [['Swiper Go Swiping','swipergoswiping'],['EquiTeach','equiteach'],['Haven','haven-vjxtpg'],['Rentech','rentech']]) {
		await expect(page.locator('.hackathon-entry').filter({has:page.getByRole('heading',{name:new RegExp(title)})})).toHaveAttribute('href',`https://devpost.com/software/${slug}`);
	}
	await page.getByRole('button',{name:'Robotics & ML',exact:true}).click();
	await expect(page.locator('.project-row')).toHaveCount(2);
	await expect(page.locator('.hackathon-entry')).toHaveCount(4);
});

test('light project hover distinguishes the full row while its summary stays readable', async ({page}) => {
	await page.emulateMedia({colorScheme: 'light', reducedMotion: 'reduce'});
	await page.goto('/projects/');
	const card = page.getByRole('link', {name: 'Explore TRILL', exact: true});
	await card.scrollIntoViewIfNeeded();
	const atRest = await card.boundingBox();
	await card.hover();
	await expect.poll(() => card.evaluate(row => {
		function luminance(color: string) {
			const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(value => {
				const s = Number(value) / 255;
				return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
			});
			return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
		}
		const fill = getComputedStyle(row).backgroundColor;
		if (fill === 'rgba(0, 0, 0, 0)') return false;
		const surface = luminance(fill);
		const paper = luminance(getComputedStyle(document.body).backgroundColor);
		const summary = luminance(getComputedStyle(row.querySelector('p')!).color);
		return (paper + .05) / (surface + .05) >= 1.25 && (surface + .05) / (summary + .05) >= 4.5;
	})).toBe(true);
	expect(await card.boundingBox()).toEqual(atRest);
	await expect(page.locator('.project-row').nth(1)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
	await page.mouse.move(0, 0);
	await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});
