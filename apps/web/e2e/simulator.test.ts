import type { Page } from '@playwright/test';
import { expect, test } from './fixtures.ts';

const metricsRow = (page: Page, controller: string) =>
	page
		.getByRole('region', { name: 'Ukazatele' })
		.getByRole('row', { name: new RegExp(controller) });

test('shows the reference scenario as simulation output, not demo data', async ({ page }) => {
	await page.goto('simulator/');

	await expect(page.getByText('VÝSTUP SIMULACE')).toBeVisible();
	await expect(page.getByText('DEMO DATA')).toHaveCount(0);
	await expect(page.getByText(/Výsledek modelu, ne předpověď/)).toBeVisible();

	const pi = metricsRow(page, 'Chytrá hlavice');
	await expect(pi).toContainText(/6,86\skWh/);
	await expect(pi).toContainText(/226,0\smin/);
	await expect(pi).toContainText(/0,29\sK/);
});

test('compares only the selected controllers', async ({ page }) => {
	await page.goto('simulator/');
	const rows = page.getByRole('region', { name: 'Ukazatele' }).getByRole('row');
	await expect(rows).toHaveCount(5);

	await page.getByRole('checkbox', { name: /PI bez anti-windupu/ }).uncheck();

	await expect(rows).toHaveCount(4);
	await expect(metricsRow(page, 'PI bez anti-windupu')).toHaveCount(0);
});

test('explains why PI cannot be tuned without radiator lag', async ({ page }) => {
	await page.goto('simulator/');

	await page.getByLabel('Setrvačnost radiátoru').fill('0');

	await expect(page.getByText('PI regulátory se nesimulují')).toBeVisible();
	await expect(metricsRow(page, 'Chytrá hlavice')).toHaveCount(0);
	await expect(metricsRow(page, 'Termostatická hlavice')).toBeVisible();
});
