import type { Linter } from 'eslint';

import { interopDefault } from '../util';

export async function typescript(): Promise<Linter.Config[]> {
  const [pluginTs, parserTs] = await Promise.all([
    interopDefault(import('@typescript-eslint/eslint-plugin')),
    // @ts-expect-error missing types
    interopDefault(import('@typescript-eslint/parser')),
  ] as const);

  return [
    {
      files: ['**/*.?([cm])[jt]s?(x)'],
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          createDefaultProgram: false,
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 'latest',
          extraFileExtensions: ['.vue'],
          jsxPragma: 'React',
          project: './tsconfig.*.json',
          sourceType: 'module',
        },
      },
      plugins: {
        '@typescript-eslint': pluginTs,
      },
      rules: {
        ...pluginTs.configs['eslint-recommended'].overrides?.[0].rules,
        ...pluginTs.configs.strict.rules,
        // Relaxed TypeScript rules for better development experience
        '@typescript-eslint/ban-ts-comment': 'off', // Allow ts-ignore, ts-expect-error without description
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off', // Allow empty functions
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off', // Allow non-null assertions
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off', // Completely disabled
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off', // Allow require() statements
        'unused-imports/no-unused-vars': 'off',
      },
    },
  ];
}
