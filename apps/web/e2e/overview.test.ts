import { expect, test } from './fixtures.ts';

test('shows the home at a glance with demo data clearly labelled', async ({ page }) => {
	await page.goto('./');

	await expect(page.getByRole('heading', { level: 1, name: 'Přehled' })).toBeVisible();
	await expect(page.getByText('DEMO DATA').filter({ visible: true })).toBeVisible();
	await expect(page.getByText('Neděle 8. listopadu · 08:24')).toBeVisible();

	const alerts = page.getByRole('region', { name: /Upozornění/ }).getByRole('link');
	await expect(alerts).toHaveText([
		/Toaleta: hlavice odpojená/,
		/Koupelna: okno otevřené 12\smin/,
		/Chodba: zastaralé měření/
	]);

	await expect(
		page.getByRole('link', { name: 'Obývák, naměřeno 20,6 °C, cíl 22,0 °C, Topí' })
	).toBeVisible();
});

test('opens a room from its tile', async ({ page }) => {
	await page.goto('./');

	await page.getByRole('link', { name: /^Ložnice, naměřeno/ }).click();

	await expect(page).toHaveURL(/\/doma\/mistnosti\/loznice\/$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Ložnice' })).toBeVisible();
});

test('switches the whole home to night mode', async ({ page }) => {
	await page.goto('./');

	await page.getByRole('button', { name: 'Noc' }).click();

	await expect(page.getByRole('status').filter({ hasText: 'Režim Noc platí' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Noc' })).toHaveAttribute('aria-pressed', 'true');
	await expect(
		page.getByRole('link', { name: /^Obývák, naměřeno 20,6 °C, cíl 19,0 °C/ })
	).toBeVisible();
});

test('disables control and explains why when the home server is unreachable', async ({ page }) => {
	await page.goto('./?demo=offline');

	await expect(page.getByRole('alert')).toContainText('Bez spojení s domácím serverem');
	await expect(page.getByRole('button', { name: 'Pryč' })).toBeDisabled();
});
