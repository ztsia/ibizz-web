import type { Linter } from 'eslint';

import { interopDefault } from '../util';

export async function perfectionist(): Promise<Linter.Config[]> {
  const perfectionistPlugin = await interopDefault(
    import('eslint-plugin-perfectionist'),
  );

  return [
    // Disabled most perfectionist rules for more flexibility
    // perfectionistPlugin.configs['recommended-natural'],
    {
      plugins: {
        perfectionist: perfectionistPlugin,
      },
      rules: {
        // Relaxed perfectionist rules - most sorting requirements disabled
        'perfectionist/sort-exports': 'off', // Allow flexible export ordering
        'perfectionist/sort-imports': 'off', // Allow flexible import ordering
        'perfectionist/sort-modules': 'off',
        'perfectionist/sort-named-exports': 'off', // Allow flexible named export ordering
        'perfectionist/sort-objects': 'off', // Allow flexible object property ordering
        'perfectionist/sort-interfaces': 'off', // Allow flexible interface property ordering
        'perfectionist/sort-enums': 'off', // Allow flexible enum ordering
        'perfectionist/sort-classes': 'off', // Allow flexible class member ordering
        'perfectionist/sort-array-includes': 'off',
        'perfectionist/sort-intersection-types': 'off',
        'perfectionist/sort-union-types': 'off',
      },
    },
  ];
}
