import { defineConfig, devices } from '@playwright/test';

const BASE_PATH = '/doma';
const PORT = 4173;

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${PORT}${BASE_PATH}/`,
		trace: 'retain-on-failure',
		locale: 'cs-CZ',
		timezoneId: 'Europe/Prague'
	},
	projects: [
		{
			name: 'tablet-landscape',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, hasTouch: true }
		},
		{ name: 'mobile', use: { ...devices['Pixel 7'] } }
	],
	webServer: {
		command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
		env: { BASE_PATH },
		url: `http://localhost:${PORT}${BASE_PATH}/`,
		reuseExistingServer: !process.env.CI
	}
});
