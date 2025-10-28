// ESLint override configuration to disable specific linting rules
module.exports = {
  rules: {
    // Disable unused imports/variables rules
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    
    // Disable other strict rules that might be annoying
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/no-unused-vars': 'off',
    'vue/no-unused-components': 'off',
    
    // Disable perfectionist sorting rules if they exist
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-exports': 'off',
    
    // Disable other potentially annoying rules
    'no-console': 'off',
    'no-debugger': 'off',
    'prefer-const': 'off',
    'no-var': 'off'
  }
};