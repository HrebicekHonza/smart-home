import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

const basePath = process.env.BASE_PATH ?? '';
const simulatorOnly = process.env.VITE_EDITION === 'simulator';

if (basePath !== '' && !/^\/.*[^/]$/.test(basePath)) {
	throw new Error(`BASE_PATH must start with "/" and must not end with "/", got "${basePath}"`);
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ strict: true }),
			paths: { base: basePath as '' | `/${string}`, relative: true },
			prerender: {
				handleHttpError: 'fail',
				handleMissingId: 'fail',
				...(simulatorOnly && { entries: ['/', '/simulator'], handleUnseenRoutes: 'ignore' })
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
