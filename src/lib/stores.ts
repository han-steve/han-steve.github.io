import { writable } from 'svelte/store';

export const headerAnimationComplete = writable(false);
export const navigationTransitionActive = writable(false);

export const projectTransitionSlug = writable<string | null>(null);
