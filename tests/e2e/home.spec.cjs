// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('https://sos2324-jul-nrm-428011.ew.r.appspot.com');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/APIs nicredmor/);
});

test('loads data list on button click', async ({ page }) => {
  await page.goto('https://sos2324-jul-nrm-428011.ew.r.appspot.com/ufc-events-data');

  // Click the "Insertar datos" button
  await page.locator('text=Insertar datos').click();

  // Wait for the list container to be visible
  await page.waitForSelector('.event-box'); // Replace with actual CSS selector for event container

  // Verify the list contains elements
  const items = await page.$$('.event-box'); // Replace with actual CSS selector for event items
  expect(items.length).toBeGreaterThan(0);
});
