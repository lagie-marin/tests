const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const json = require('eslint-plugin-json');
const markdown = require('@eslint/markdown');
const yaml = require('eslint-plugin-yaml');
const nuxt = require('eslint-plugin-nuxt');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            'coverage/',
            
            'backend/**/*',
            'frontend/**/*',
            'mobile/**/*',
            
            '.nuxt/**/*',
            '.nuxt-types/**/*',
            '.nitro/**/*',
            '.output/**/*',
            '**/.nuxt/**/*',
            '**/dist/**/*',
            '**/build/**/*',
            
            'pnpm-lock.yaml',
            'pnpm-workspace.yaml',
            'yarn.lock',
            'package-lock.json',
            '*.log',
            '**/*.log',

            '**/*.d.ts',
            '**/*.min.js',
            '**/*.json',
            '**/*.md',

            'eslint.config.js',
            'eslint.config.backup.js'
        ]
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true
                }
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                test: 'readonly',
                describe: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                createRemoteCollection: 'readonly'
            }
        },
        plugins: { prettier },
        rules: {
            'prettier/prettier': 'error',
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
            'no-empty': 'warn'
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            globals: {
                ...globals.node,
                ...globals.browser,
                defineAppConfig: 'readonly',
                defineNuxtConfig: 'readonly',
                defineEventHandler: 'readonly',
                useRuntimeConfig: 'readonly',
                sendRedirect: 'readonly',
                proxyRequest: 'readonly',
                useFetch: 'readonly'
            }
        },
        plugins: { '@typescript-eslint': typescriptPlugin },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-undef': 'off'
        }
    },
    {
        files: ['**/.nuxt/ui/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off'
        }
    },
    {
        files: ['**/*.yaml', '**/*.yml'],
        languageOptions: {
            globals: {
                frontend: 'readonly',
                backend: 'readonly',
                better: 'readonly',
                sqlite3: 'readonly',
                esbuild: 'readonly',
                sharp: 'readonly',
                unrs: 'readonly',
                resolver: 'readonly',
                vue: 'readonly',
                demi: 'readonly'
            }
        },
        plugins: { yaml }
    },
    {
        files: ['**/*.json'],
        plugins: { json, prettier }
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        processor: 'markdown/markdown'
    },
    {
        files: ['**/*.nuxt'],
        plugins: { nuxt },
        rules: {
            'nuxt/prefer-import-meta': 'error'
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
                process: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                createRemoteCollection: 'readonly'
            }
        }
    }
];