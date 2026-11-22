// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface Window {
		__siteEntrance?: { release(): void };
	}
	namespace App {
		interface PageState {
			detailPath?: string;
			originDetailPath?: string;
			skipSheetMotion?: boolean;
			projectSlug?: string;
			returnTo?: string;
			originProjectSlug?: string;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
