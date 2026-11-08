import { test as base } from '@playwright/test';

export const DEMO_NOW = new Date('2026-11-08T08:24:00+01:00');

export const test = base.extend({
	page: async ({ page }, use) => {
		await page.clock.setFixedTime(DEMO_NOW);
		await use(page);
	}
});

export { expect } from '@playwright/test';
