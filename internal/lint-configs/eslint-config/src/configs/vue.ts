import type { Linter } from 'eslint';

import { interopDefault } from '../util';

export async function vue(): Promise<Linter.Config[]> {
  const [pluginVue, parserVue, parserTs] = await Promise.all([
    interopDefault(import('eslint-plugin-vue')),
    interopDefault(import('vue-eslint-parser')),
    // @ts-expect-error missing types
    interopDefault(import('@typescript-eslint/parser')),
  ] as const);

  const flatEssential = pluginVue.configs?.['flat/essential'] || [];
  const flatStronglyRecommended =
    pluginVue.configs?.['flat/strongly-recommended'] || [];
  const flatRecommended = pluginVue.configs?.['flat/recommended'] || [];

  return [
    ...flatEssential,
    ...flatStronglyRecommended,
    ...flatRecommended,
    {
      files: ['**/*.vue'],
      languageOptions: {
        // globals: {
        //   computed: 'readonly',
        //   defineEmits: 'readonly',
        //   defineExpose: 'readonly',
        //   defineProps: 'readonly',
        //   onMounted: 'readonly',
        //   onUnmounted: 'readonly',
        //   reactive: 'readonly',
        //   ref: 'readonly',
        //   shallowReactive: 'readonly',
        //   shallowRef: 'readonly',
        //   toRef: 'readonly',
        //   toRefs: 'readonly',
        //   watch: 'readonly',
        //   watchEffect: 'readonly',
        // },
        parser: parserVue,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          extraFileExtensions: ['.vue'],
          parser: parserTs,
          sourceType: 'module',
        },
      },
      plugins: {
        vue: pluginVue,
      },
      processor: pluginVue.processors?.['.vue'],
      rules: {
        ...pluginVue.configs?.base?.rules,

        // Relaxed Vue rules for better development experience
        'vue/attribute-hyphenation': 'off', // Allow both kebab-case and camelCase
        'vue/attributes-order': 'off',
        'vue/block-order': 'off', // Allow flexible block ordering
        'vue/component-name-in-template-casing': 'off', // Allow both PascalCase and kebab-case
        'vue/component-options-name-casing': 'off',
        'vue/custom-event-name-casing': 'off', // Allow flexible event naming
        'vue/define-macros-order': 'off', // Allow flexible macro ordering
        'vue/dot-location': 'off',
        'vue/dot-notation': 'off',
        'vue/eqeqeq': 'off', // Allow == and === based on preference
        'vue/html-closing-bracket-newline': 'off', // Allow flexible bracket placement
        'vue/html-indent': 'off',
        'vue/html-quotes': 'off', // Allow both single and double quotes
        'vue/html-self-closing': 'off', // Allow flexible self-closing tags
        'vue/max-attributes-per-line': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/multiline-html-element-content-newline': 'off', // Allow flexible content formatting
        'vue/no-empty-pattern': 'warn', // Downgrade to warning
        'vue/no-extra-parens': 'off',
        'vue/no-irregular-whitespace': 'warn', // Downgrade to warning
        'vue/no-loss-of-precision': 'warn', // Downgrade to warning
        'vue/no-reserved-component-names': 'off',
        'vue/no-restricted-syntax': 'off', // Allow more syntax flexibility
        'vue/no-restricted-v-bind': 'off', // Allow flexible v-bind usage
        'vue/no-sparse-arrays': 'warn', // Downgrade to warning
        'vue/no-unused-refs': 'warn', // Downgrade to warning
        'vue/no-useless-v-bind': 'warn', // Downgrade to warning
        'vue/object-shorthand': 'off', // Allow both shorthand and full syntax
        'vue/one-component-per-file': 'off', // Allow multiple components per file
        'vue/prefer-import-from-vue': 'off',
        'vue/prefer-separate-static-class': 'off',
        'vue/prefer-template': 'off', // Allow both template literals and concatenation
        'vue/prop-name-casing': 'off', // Allow flexible prop naming
        'vue/require-default-prop': 'off', // Don't require default props
        'vue/require-explicit-emits': 'off', // Don't require explicit emits
        'vue/require-prop-types': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/space-infix-ops': 'off',
        'vue/space-unary-ops': 'off',
        'vue/v-on-event-hyphenation': 'off', // Allow flexible event naming
      },
    },
  ];
}
