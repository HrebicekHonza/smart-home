import { expect, test } from '@playwright/test';

test('navigates from the overview to the simulator', async ({ page }) => {
	await page.goto('./');
	await expect(page.getByRole('heading', { level: 1, name: 'Přehled' })).toBeVisible();

	const navigation = page.getByRole('navigation', { name: 'Hlavní navigace' });
	await expect(navigation.getByRole('link', { name: 'Přehled' })).toHaveAttribute(
		'aria-current',
		'page'
	);

	await navigation.getByRole('link', { name: 'Simulátor' }).click();

	await expect(page).toHaveURL(/\/doma\/simulator\/$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Simulátor' })).toBeVisible();
	await expect(navigation.getByRole('link', { name: 'Simulátor' })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('opens a subpage directly under the base path', async ({ page }) => {
	const response = await page.goto('simulator/');

	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { name: 'Simulační jádro není připojeno' })).toBeVisible();
});

test('lets keyboard users skip to the main content', async ({ page, isMobile }) => {
	test.skip(isMobile, 'Keyboard navigation is verified on the tablet layout.');
	await page.goto('./');

	await page.keyboard.press('Tab');
	const skipLink = page.getByRole('link', { name: 'Přeskočit na obsah' });
	await expect(skipLink).toBeFocused();

	await page.keyboard.press('Enter');
	await expect(page.locator('main')).toBeFocused();
});
