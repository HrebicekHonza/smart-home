import { expect, test } from './fixtures.ts';

test('changes the target only after the thermostats confirm it', async ({ page }) => {
	await page.goto('mistnosti/obyvak/');
	const target = page.getByRole('region', { name: 'Požadovaná teplota' });

	await target.getByRole('button', { name: 'Zvýšit o 0,5 °C' }).click();
	await expect(target.getByTestId('target-draft')).toHaveText('22,5°C');
	await expect(target.getByText(/Nový cíl · nyní 22,0\s°C/)).toBeVisible();

	await target.getByRole('button', { name: 'Nastavit 22,5 °C' }).click();
	await expect(target.getByText('Příkaz se nepodařilo provést')).toBeVisible();
	await expect(target.getByText(/Nyní platí\s+rozvrh\s+22,0\s°C/)).toBeVisible();

	await target.getByRole('button', { name: 'Zkusit znovu' }).click();
	await expect(target.getByText(/Cíl 22,5\s°C nastaven/)).toBeVisible();
	await expect(target.getByText(/Nyní platí\s+ruční změna\s+22,5\s°C\s+· do 10:24/)).toBeVisible();
	await expect(target.getByRole('button', { name: 'Beze změny' })).toBeDisabled();
});

test('shows that heating is paused while a window is open', async ({ page }) => {
	await page.goto('./');

	await page.getByRole('link', { name: /Koupelna: okno otevřené/ }).click();

	await expect(page.getByRole('heading', { level: 1, name: 'Koupelna' })).toBeVisible();
	await expect(page.getByRole('note')).toContainText('Okno je otevřené 12');
	await expect(page.getByRole('note')).toContainText('Topení je pozastavené');
	await expect(page.getByRole('region', { name: 'Naměřená teplota' })).toContainText('Pozastaveno');
});

test('blocks target changes in a room whose thermostat is offline', async ({ page }) => {
	await page.goto('mistnosti/toaleta/');
	const target = page.getByRole('region', { name: 'Požadovaná teplota' });

	await expect(page.getByRole('note')).toContainText('Hlavice neodpovídá od 05:12');
	await expect(target.getByRole('button', { name: 'Zvýšit o 0,5 °C' })).toBeDisabled();
	await expect(target.getByText('Hlavice je odpojená, změnu nelze odeslat.')).toBeVisible();
});

test('opens and closes the history dialog with a shareable URL', async ({ page }) => {
	await page.goto('mistnosti/obyvak/');

	await page.getByRole('button', { name: 'Historie', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Historie · Obývák' });
	await expect(dialog).toBeVisible();
	await expect(page).toHaveURL(/historie=24h/);
	await expect(dialog.getByRole('button', { name: 'Zavřít historii' })).toBeFocused();

	await dialog.getByRole('button', { name: '7 dní' }).click();
	await expect(page).toHaveURL(/historie=7d/);

	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(page).not.toHaveURL(/historie/);

	await page.goto('mistnosti/obyvak/?historie=24h');
	await expect(page.getByRole('dialog', { name: 'Historie · Obývák' })).toBeVisible();
});

test('lets keyboard users skip to the main content', async ({ page, isMobile }) => {
	test.skip(isMobile, 'Keyboard navigation is verified on the tablet layout.');
	await page.goto('./');

	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Přeskočit na obsah' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('main')).toBeFocused();
});
