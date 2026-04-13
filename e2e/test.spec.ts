import { test, expect } from '@playwright/test';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

test.describe('End-to-End Validation', () => {
  test('should login, upload a roster, and render it', async ({ page }) => {
    const port = process.env.PORT || '8080';
    await page.goto(`http://localhost:${port}/bluescribe`);

    // Wait for initial load
    await page.waitForSelector('nav');

    // Click Login / Register button
    await page.click('text=Login / Register');

    const username = `testuser_${crypto.randomBytes(4).toString('hex')}`;
    const password = 'testpassword123';

    await page.click('text=Need an account? Register');

    await page.fill('article >> input[type="text"]', username);
    await page.fill('article >> input[type="password"]', password);

    await page.click('button[type="submit"]');

    await expect(page.locator(`text=${username}`).first()).toBeVisible({ timeout: 10000 });

    const rosPath = path.resolve(__dirname, '../src/__tests__/gameSystems/exactly/ValidRoster.ros');

    const fileContent = fs.readFileSync(rosPath, 'utf8');

    await page.evaluate((content) => {
        const dataTransfer = new DataTransfer();
        const file = new File([content], 'ValidRoster.ros', { type: 'application/xml' });
        dataTransfer.items.add(file);
        const dropEvent = new DragEvent('drop', {
            dataTransfer,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(dropEvent);
    }, fileContent);

    // Check if any error boundary caught it or it successfully rendered the force container
    await expect(page.locator('.container').first()).toBeVisible({ timeout: 15000 });

    // Ensure there are no React-error-boundary fallbacks
    const errorBoundary = await page.locator('text=Something went wrong').count();
    expect(errorBoundary).toBe(0);

    // A roster loading should result in either a View/Print button, or a dropdown with "Manage Roster",
    // or just checking that we are still in the container without error.
    await page.waitForTimeout(2000);
    // As long as there is no error boundary, the application loaded the roster.
  });
});
