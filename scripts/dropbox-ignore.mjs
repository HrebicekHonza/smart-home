import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const generatedDirs = [
	'node_modules',
	'packages/core/node_modules',
	'packages/simulation/node_modules',
	'apps/web/node_modules',
	'apps/web/.svelte-kit',
	'apps/web/build',
	'apps/web/test-results',
	'apps/web/playwright-report'
];

const markIgnored = {
	win32: (dir) => writeFileSync(`${dir}:com.dropbox.ignored`, '1'),
	darwin: (dir) => execFileSync('xattr', ['-w', 'com.dropbox.ignored', '1', dir]),
	linux: (dir) => execFileSync('attr', ['-s', 'com.dropbox.ignored', '-V', '1', dir])
}[process.platform];

if (!markIgnored) {
	console.error(`Unsupported platform: ${process.platform}`);
	process.exit(1);
}

for (const relativeDir of generatedDirs) {
	const dir = join(root, relativeDir);
	mkdirSync(dir, { recursive: true });
	markIgnored(dir);
	console.log(`Dropbox ignores ${relativeDir}`);
}
