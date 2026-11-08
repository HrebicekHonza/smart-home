import { createContext } from 'svelte';
import type { HomeState } from '#lib/state/home-state.svelte.ts';

export const [getHome, setHome] = createContext<HomeState>();
