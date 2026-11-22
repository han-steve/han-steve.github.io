export interface YouTubePlayer {
	playVideo(): void;
	pauseVideo(): void;
	destroy(): void;
}
type PlayerEvent = { target: YouTubePlayer; data?: number };
type YouTubeAPI = {
	Player: new (frame: HTMLIFrameElement, options: {
		events: {
			onReady(event: PlayerEvent): void;
			onStateChange(event: PlayerEvent): void;
			onError(event: PlayerEvent): void;
		};
	}) => YouTubePlayer;
};
let pending: Promise<YouTubeAPI> | undefined;

// Load only after a visitor chooses to watch an embedded film.
export function loadYouTube(): Promise<YouTubeAPI> {
	const host = window as Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };
	if (host.YT?.Player) return Promise.resolve(host.YT);
	if (pending) return pending;
	pending = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		const previous = host.onYouTubeIframeAPIReady;
		const fail = () => {
			clearTimeout(timeout);
			script.remove();
			pending = undefined;
			reject(new Error('The video player could not load.'));
		};
		const timeout = setTimeout(fail, 12000);
		host.onYouTubeIframeAPIReady = () => {
			clearTimeout(timeout);
			previous?.();
			if (host.YT?.Player) resolve(host.YT);
			else fail();
		};
		script.src = 'https://www.youtube.com/iframe_api';
		script.async = true;
		script.onerror = fail;
		document.head.append(script);
	});
	return pending;
}
