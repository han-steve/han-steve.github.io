import { test, expect } from '@playwright/test';

test('project filtering and keyboard tools', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/projects/');
	await page.getByRole('button', { name: 'Robotics & ML', exact: true }).click();
	await expect(page.locator('.project-row')).toHaveCount(2);
	await page.getByRole('button', { name: 'Web & hardware', exact: true }).click();
	await expect(page.locator('.project-row')).toHaveCount(2);
	await page.getByRole('button', { name: 'All', exact: true }).click();
	await expect(page.locator('.project-row')).toHaveCount(4);
	await page.goto('/');
	await page.getByRole('button', { name: 'Ray', exact: true }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('button', { name: 'Ray', exact: true }).locator('.tech-text')).toContainText('training foundation models');
	await expect(page.getByRole('button', { name: 'Ray', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('theme follows system, remembers a choice, survives navigation and reload', async ({
	page
}) => {
	await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.getByRole('button', { name: 'Switch to light mode' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await page.getByRole('link', { name: 'Explore TRILL' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('TRILL');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await page.getByRole('link', { name: 'Close project', exact: true }).click();
	await page.getByRole('button', { name: 'Switch to dark mode' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('blocked localStorage does not break rendering or theme controls', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(Storage.prototype, 'getItem', {
			value: () => {
				throw new Error('Storage blocked');
			}
		});
		Object.defineProperty(Storage.prototype, 'setItem', {
			value: () => {
				throw new Error('Storage blocked');
			}
		});
	});
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/');
	await page.getByRole('button', { name: 'Switch to dark mode' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	expect(errors).toEqual([]);
});

test('real View Transition preserves TRILL artwork and browser Back', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.addInitScript(() => {
		const original = document.startViewTransition.bind(document);
		(window as any).__transitionEvents = [];
		document.startViewTransition = ((callback: any) => {
			const transition = original(callback);
			(window as any).__transitionEvents.push('started');
			transition.ready.then(
				() => (window as any).__transitionEvents.push('ready'),
				(error: Error) => (window as any).__transitionEvents.push('error:' + error.message)
			);
			transition.finished.then(() => (window as any).__transitionEvents.push('finished'));
			return transition;
		}) as typeof document.startViewTransition;
	});
	await page.goto('/');
	const card = page.getByRole('link', { name: 'Explore TRILL' });
	const before = {
		name: await card.locator('.project-icon').evaluate(tile => getComputedStyle(tile).viewTransitionName),
		src: await card.locator('img').getAttribute('src')
	};
	expect(before.name).toBe('none');
	await card.click();
	await expect(page).toHaveURL(/\/projects\/trill\/$/);
	await expect(page.locator('.project-title-art img')).toHaveAttribute('src', before.src!);
	expect(
		await page
			.locator('.project-title-art')
			.evaluate(tile => getComputedStyle(tile).viewTransitionName)
	).toBe('project-trill-art');
	await expect(page.locator('.project-title-art img')).toHaveCSS('view-transition-name', 'none');
	await expect
		.poll(() => page.evaluate(() => (window as any).__transitionEvents))
		.toContain('ready');
	await expect
		.poll(() => page.evaluate(() => (window as any).__transitionEvents))
		.toContain('finished');
	expect(
		await page.evaluate(() =>
			(window as any).__transitionEvents.filter((e: string) => e.startsWith('error'))
		)
	).toEqual([]);
	await page.goBack();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Steve Han.');
	await expect(card).toBeVisible();
});

for (const mode of ['reduced', 'unsupported'] as const) {
	test(`navigation works with ${mode} transitions`, async ({ page }) => {
		if (mode === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.addInitScript((mode) => {
			(window as any).__transitionCalls = 0;
			if (mode === 'unsupported')
				Object.defineProperty(document, 'startViewTransition', { value: undefined });
			else
				document.startViewTransition = (() => {
					(window as any).__transitionCalls++;
					throw new Error('Reduced-motion transition called');
				}) as any;
		}, mode);
		await page.goto('/');
		await page.getByRole('link', { name: 'Explore TRILL' }).click();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('TRILL');
		expect(await page.evaluate(() => (window as any).__transitionCalls)).toBe(0);
		await page.getByRole('link', { name: 'Close project', exact: true }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.locator('.project-row')).toHaveCount(4);
	});
}

test('YouTube players are opt-in, retain direct links and use the privacy-enhanced host', async ({
	page
}) => {
	const requests: string[] = [];
	page.on('request', (r) => {
		if (/youtube|ytimg|googlevideo/.test(r.url())) requests.push(r.url());
	});
	await page.goto('/projects/voxcraft-vr/');
	await expect(page.locator('iframe')).toHaveCount(0);
	await expect(page.locator('.hero-video figcaption')).toHaveCount(0);
	expect(requests).toEqual([]);
	await expect(page.getByRole('link', { name: 'Watch gameplay', exact: true })).toHaveAttribute(
		'href',
		'https://www.youtube.com/watch?v=OoZKp4ltCj0'
	);
	await page.getByRole('button', { name: 'Play VoxCraft VR gameplay' }).click();
	const embed = new URL((await page.locator('iframe').getAttribute('src'))!);
	expect(embed.origin + embed.pathname).toBe('https://www.youtube-nocookie.com/embed/OoZKp4ltCj0');
	expect(embed.searchParams.get('playsinline')).toBe('1');
	expect(embed.searchParams.get('enablejsapi')).toBe('1');
	await expect(page.locator('iframe')).toHaveAttribute('title', 'VoxCraft VR gameplay');
});

test('native preview respects reduced motion and Save-Data', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/projects/trill/');
	await page.locator('video').scrollIntoViewIfNeeded();
	expect(
		await page.locator('video').evaluate((v) => ({
			paused: (v as HTMLVideoElement).paused,
			muted: (v as HTMLVideoElement).muted,
			inline: (v as HTMLVideoElement).playsInline,
			preload: (v as HTMLVideoElement).preload
		}))
	).toEqual({ paused: true, muted: true, inline: true, preload: 'none' });
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'connection', { value: { saveData: true } })
	);
	await page.reload();
	await page.locator('video').scrollIntoViewIfNeeded();
	expect(await page.locator('video').evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
});

test('native preview actually plays, pauses and pauses when offscreen', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 600 });
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/projects/trill/');
	await page.locator('video').scrollIntoViewIfNeeded();
	await expect
		.poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).currentTime), { timeout: 20000 })
		.toBeGreaterThan(0);
	await page.getByRole('button', { name: 'Pause video preview' }).click();
	await expect.poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
	await page.getByRole('button', { name: 'Play video preview' }).click();
	await expect.poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).paused)).toBe(false);
	await page.locator('.sheet-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; });
	await expect(page.locator('video')).not.toBeInViewport();
	await expect.poll(() => page.locator('video').evaluate((v) => (v as HTMLVideoElement).paused)).toBe(true);
});

test.describe('project preview audio on a phone', () => {
	test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

	test('tapping the speaker toggles audio while the preview plays', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/projects/trill/');
		const video = page.locator('.project-hero video');
		const unmute = page.getByRole('button', { name: 'Unmute video', exact: true });
		const mute = page.getByRole('button', { name: 'Mute video', exact: true });

		await expect(video).toHaveJSProperty('muted', true);
		await page.getByRole('button', { name: 'Play video preview' }).tap();
		await expect(page.getByRole('button', { name: 'Pause video preview' })).toBeVisible();
		await unmute.tap();
		await expect(video).toHaveJSProperty('muted', false);
		await expect(video).toHaveJSProperty('paused', false);
		await expect(mute).toBeVisible();
		await mute.tap();
		await expect(video).toHaveJSProperty('muted', true);
		await expect(unmute).toBeVisible();
	});
});

test('downloadable resume, canonical URLs, sitemap and unpublished blog routes', async ({ page, request }) => {
	await page.goto('/cv/');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hansteve.com/cv/');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
	const resume = await request.get('/Steve_Resume.pdf');
	expect(resume.ok()).toBe(true);
	expect(resume.headers()['content-type']).toContain('application/pdf');
	const sitemap = await (await request.get('/sitemap.xml')).text();
	expect(sitemap).toContain('https://hansteve.com/projects/trill/');
	expect(sitemap).not.toContain('/blog/');
	for (const path of ['/blog/', '/blog/nginx-ingress-vs-ingress-nginx/', '/feed.xml']) {
		expect((await request.get(path)).status()).toBe(404);
	}
});

test('pre-rendered content and project links work without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false, baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4178' });
	const page = await context.newPage();
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Steve Han.');
	await page.getByRole('link', { name: 'Explore TRILL' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('TRILL');
	await page.goto('/cv/');
	await expect(page.getByRole('heading', { name: 'Talks and articles' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Download resume' })).toHaveAttribute('href', '/Steve_Resume.pdf');
	await context.close();
});

test('unknown routes render the branded 404 with recovery navigation', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist/');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
	await page.getByRole('link', { name: 'Head home' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Steve Han.');
});


test('homepage additions follow the original bio and bubbles', async ({ page }) => {
	await page.goto('/');
	const main = page.getByRole('main');
	const paragraphs = main.locator(':scope > p');
	await expect(paragraphs).toHaveCount(5);
	await expect(paragraphs.nth(0)).toHaveText("I'm currently building the Machine Learning Platform for the metaverse at Roblox.");
	await expect(paragraphs.nth(1)).toContainText('Previously, I interned twice at Amazon, where I built serverless full-stack applications');
	await expect(paragraphs.nth(2)).toHaveText(
		"I love learning new technologies and understanding how things work from first principles. My passion is to use computing to build scalable automations, create delightful interactions, and enhance our well-being. To these ends, I've learned the following tools. The sizes are proportional to my proficiency. You can poke at them to learn more."
	);
	const education = paragraphs.nth(3);
	const research = paragraphs.nth(4);
	await expect(education).toHaveText('I graduated from the University of Texas at Austin with a Masters and a Bachelors in Computer Science, a Bachelors in Math, and a certificate in Spanish.');
	await expect(research).toContainText('For my master’s, I worked on TRILL at the Robot Perception and Learning Lab (RPL).');
	await expect(research).toContainText('We used imitation learning to teach a humanoid robot household tasks');
	await expect(research.getByRole('link', { name: 'TRILL', exact: true })).toHaveAttribute('href', '/projects/trill/');
	await expect(education.locator('xpath=preceding-sibling::*[1]').locator('.bubble-chart')).toHaveCount(1);
	await expect(education.locator('xpath=preceding-sibling::section')).toHaveCount(0);
	await expect(main.getByRole('region', { name: 'Experience' })).toBeVisible();
	await expect(main.locator('a[href*="youtube.com"], a[href^="/blog"]')).toHaveCount(0);
});

test('original bubbles stay centered across full-page capture and resize, and toggle on click', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.bubble-chart').scrollIntoViewIfNeeded();
    await expect(page.locator('.node')).toHaveCount(22);
    const centers = () => page.locator('.node').evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect();
        return box.x + box.width / 2;
    }));
    await expect.poll(async () => (await centers()).every(x => x > 250 && x < 1190)).toBe(true);
    const before = await centers();
    await page.screenshot({ path: 'qa/restored-bubbles-desktop.png', fullPage: true });
    const after = await centers();
    expect(after.every((x, i) => Math.abs(x - before[i]) < 1)).toBe(true);
    const ray = page.getByRole('button', { name: 'Ray', exact: true });
    await ray.click();
    await expect(ray).toHaveAttribute('aria-pressed', 'true');
    await ray.click();
    await expect(ray).toHaveAttribute('aria-pressed', 'false');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.bubble-chart').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await centers()).every(x => x >= 10 && x <= 380)).toBe(true);
    await page.screenshot({ path: 'qa/restored-bubbles-mobile.png', fullPage: true });
});

test('bubble labels fit the settled circle and switch without a stale caption', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('skipAnimation', 'TRUE'));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/');
	const chart = page.locator('.bubble-chart');
	await chart.scrollIntoViewIfNeeded();
	const ray = chart.getByRole('button', { name: 'Ray', exact: true });
	const kubernetes = chart.getByRole('button', { name: 'Kubernetes', exact: true });
	await expect(ray).toHaveCSS('opacity', '1');
	await ray.press('Enter');
	await kubernetes.press('Enter');
	await kubernetes.press('Escape');
	await ray.press('Space');
	await expect(kubernetes.locator('.tech-text')).toHaveCSS('opacity', '0');
	await expect(ray.locator('.tech-text')).toHaveCSS('opacity', '1');
	await expect(ray.locator('.bubble-surface')).toHaveAttribute('r', '100');
	const layout = await ray.evaluate(group => {
		const face = group.querySelector('circle')!;
		const label = group.querySelector<SVGGElement>('.tech-text')!;
		const clip = label.parentElement!.getAttribute('clip-path')!;
		const reference = document.getElementById(clip.slice(5, -1))?.querySelector('use');
		const lines = Array.from(label.querySelectorAll<SVGGraphicsElement>('.name-text, tspan'));
		const fits = lines.every(line => {
			const { x, y, width, height } = line.getBBox();
			return Math.hypot(Math.max(-x, x + width), Math.max(-y, y + height)) <= face.r.baseVal.value;
		});
		return { followsFace: reference?.getAttribute('href') === '#' + face.id, fits, lines: lines.length };
	});
	expect(layout.followsFace).toBe(true);
	expect(layout.fits).toBe(true);
	expect(layout.lines).toBeGreaterThan(2);
});

test('original entrance completes, replays and cancels safely for navigation and reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('.entrance-backdrop')).toHaveClass(/running/);
    await expect(page.locator('.entrance-backdrop')).not.toHaveClass(/running/, { timeout: 6000 });
    await page.getByRole('button', { name: 'Replay entrance animation' }).click();
    await expect(page.locator('.entrance-backdrop')).toHaveClass(/running/);
    await page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('CV');
    await expect(page.locator('.entrance-backdrop')).not.toHaveClass(/running/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Replay entrance animation' }).click();
    await expect(page.locator('.entrance-backdrop')).not.toHaveClass(/running/);
});


test('top tabs retain the live site font metrics, selected shape and hover behavior', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects/');
    const tab = page.getByRole('navigation').getByRole('link', { name: 'PROJECTS', exact: true });
    await expect(tab).toHaveAttribute('aria-current', 'page');
    await expect(tab).toHaveCSS('width', '32px');
    await expect(tab).toHaveCSS('line-height', '24px');
    await expect(tab).toHaveCSS('letter-spacing', '-3.2px');
    expect(await tab.evaluate(el => getComputedStyle(el).fontFamily)).toContain('ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas');
    expect(await tab.locator('.tab-ribbon').evaluate(el => getComputedStyle(el).height)).toBe('144px');
    await tab.hover();
    await expect(tab.locator('.tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(tab.locator('.tab-label')).toHaveCSS('transform', 'none');
    const theme = await page.getByRole('button', { name: 'Switch to dark mode' }).boundingBox();
    const nav = await page.getByRole('navigation').boundingBox();
    expect(theme!.x).toBeGreaterThanOrEqual(nav!.x + nav!.width);
    expect(Math.abs(theme!.y - nav!.y)).toBeLessThan(1);
    const other = page.getByRole('navigation').getByRole('link', { name: 'CV', exact: true });
    await other.hover();
    await expect(other.locator('.tab-ribbon')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -170)');
});

test('project sheets contain their media and have no visible site navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const slug of ['trill', 'voxcraft-vr', 'self-steering-scooter', 'project-sunrise']) {
            await page.goto(`/projects/${slug}/`);
            await expect(page.getByRole('dialog')).toBeVisible();
            const panel = await page.locator('.project-sheet').boundingBox();
            const media = await page.locator('.project-hero').boundingBox();
            expect(panel!.width).toBeLessThanOrEqual(960);
            expect(panel!.height).toBeLessThanOrEqual(900);
            expect(media!.height).toBeLessThan(600);
            expect(media!.width).toBe(panel!.width);
            expect(media!.y).toBe(panel!.y);
            await expect(page.getByRole('navigation', {name: 'Main navigation'})).toHaveCount(0);
            await expect(page.getByRole('navigation', {name: 'Next project'})).toHaveCount(1);
            await expect(page.getByRole('link', {name: 'Close project', exact: true})).toBeVisible();
            expect(await page.locator('.sheet-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        }
    }
});

test('YouTube reveal waits for readiness and closing restores the same hero without a layout shift', async ({ page }) => {
    await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({contentType:'text/javascript', body: `
        window.YT = { Player: class {
            constructor(frame, options) { this.frame = frame; this.options = options; setTimeout(() => options.events.onReady({target: this}), 200); }
            playVideo() { this.options.events.onStateChange({data: 1, target: this}); }
            pauseVideo() { this.options.events.onStateChange({data: 2, target: this}); }
            destroy() { this.frame.remove(); }
        }}; window.onYouTubeIframeAPIReady();
    `}));
    await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({contentType:'text/html', body:'<html><body style="margin:0;background:#111;color:white">Player fixture</body></html>'}));
    await page.goto('/projects/voxcraft-vr/');
    const stage = page.locator('.project-hero');
    await page.locator('.project-sheet').evaluate(async el => { await Promise.all(el.getAnimations().map(animation => animation.finished)); });
    const before = await stage.boundingBox();
    await page.getByRole('button', { name: 'Play VoxCraft VR gameplay' }).click();
    await expect(stage).toHaveClass(/youtube-open/);
    await expect(page.locator('iframe')).toHaveCSS('opacity', '1');
    expect(await stage.boundingBox()).toEqual(before);
    await page.getByRole('button', { name: 'Close video' }).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(stage).not.toHaveClass(/youtube-open/);
    await expect(stage.locator('.media-poster')).toHaveCSS('opacity', '1');
    expect(await stage.boundingBox()).toEqual(before);
    await page.getByRole('link', { name: 'Close project', exact: true }).click();
    await expect(page.locator('.project-row')).toHaveCount(4);
});

test('fullscreen uses native video controls and returns the paused, scrubbed clip to the modal', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/projects/trill/');
	const video = page.locator('video');
	const expand = page.getByRole('button', { name: 'Expand video' });
	await expand.click();
	await expect.poll(() => video.evaluate((el: HTMLVideoElement) => document.fullscreenElement === el && el.controls)).toBe(true);
	await expect(page.locator('.media-controls')).toBeHidden();
	await expect(video).toHaveCSS('opacity', '1');
	await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.seekable.length && el.seekable.end(0))).toBeGreaterThan(0);
	await video.evaluate((el: HTMLVideoElement) => { el.muted = false; });

	await video.focus();
	await page.keyboard.press('ArrowRight');
	await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
	const position = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
	await page.screenshot({ path: 'qa/native-fullscreen-player.png' });
	await page.evaluate(() => document.exitFullscreen());
	await expect(expand).toBeVisible();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(video).toHaveJSProperty('controls', false);
	await expect(video).toHaveJSProperty('paused', true);
	await expect(video).toHaveJSProperty('muted', false);
	await expect(page.getByRole('button', { name: 'Mute video', exact: true })).toBeVisible();
	expect(await video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeCloseTo(position, 1);
});

test('blocked embedded player retains its artwork and direct watch link', async ({ page }) => {
    await page.route('https://www.youtube.com/iframe_api', route => route.abort());
    await page.route('https://www.youtube-nocookie.com/embed/**', route => route.abort());
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/projects/voxcraft-vr/');
    await page.getByRole('button', { name: 'Play VoxCraft VR gameplay' }).click();
    await expect(page.getByRole('status')).toContainText('This video couldn’t load.');
    await expect(page.getByRole('link', {name: 'Watch the original'})).toHaveAttribute('href', 'https://www.youtube.com/watch?v=OoZKp4ltCj0');
    await expect(page.locator('.media-poster')).toHaveCSS('opacity', '1');
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(errors).toEqual([]);
});
