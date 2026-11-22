import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './tests',
	testMatch: '*.spec.ts',
	fullyParallel: false,
	workers: 1,
	timeout: 30000,
	reporter: [['list']],
	outputDir: 'test-results',
	use: {
		baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4178',
		viewport: { width: 1440, height: 1000 },
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	}
});
