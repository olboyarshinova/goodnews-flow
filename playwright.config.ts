import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        headless: true,
        userAgent: 'Mozilla/5.0 (GoodNewsBot/1.0)',
        viewport: { width: 1280, height: 800 },
    },
    testDir: './src/__scrapers__',
    testMatch: /.*\.scraper\.ts/,
});