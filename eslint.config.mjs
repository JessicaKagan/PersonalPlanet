// @ts-check

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

export default defineConfig({
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, eslintConfigPrettier, eslintPluginPrettierRecommended],
    ignores: ['.svelte-kit/**'],
    languageOptions: {
        parserOptions: {
            projectService: true
        }
    }
});