import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

const frameworkImports = ['svelte', 'svelte/*', '@sveltejs/*', '$app/*', '#lib', '#lib/*'];

export default ts.config(
	{
		ignores: [
			'**/node_modules/',
			'**/.svelte-kit/',
			'**/build/',
			'**/test-results/',
			'**/playwright-report/',
			'docs/'
		]
	},
	js.configs.recommended,
	...ts.configs.strictTypeChecked,
	...ts.configs.stylisticTypeChecked,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		files: ['**/*.js', '**/*.mjs'],
		...ts.configs.disableTypeChecked
	},
	{
		files: ['packages/core/**', 'packages/simulation/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: frameworkImports,
							message: 'Domain and simulation packages must stay framework-independent.'
						}
					]
				}
			]
		}
	},
	{
		files: ['apps/web/src/routes/**', 'apps/web/src/lib/features/**', 'apps/web/src/lib/ui/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['#lib/adapters/*'],
							message: 'UI depends on the HomeGateway port; wire adapters in #lib/app only.'
						}
					]
				}
			]
		}
	}
);
