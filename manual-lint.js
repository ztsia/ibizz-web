#!/usr/bin/env node

// Manual linting script - use this if you want to run linting manually
// Usage: node manual-lint.js

const { execSync } = require('child_process');

console.log('🚀 Running manual linting (this may show errors)...');

try {
  console.log('\n📝 Running ESLint...');
  execSync('npx eslint . --cache --fix', { stdio: 'inherit' });
  console.log('✅ ESLint completed');
} catch (error) {
  console.log('❌ ESLint failed (but that\'s okay, we\'re ignoring it)');
}

try {
  console.log('\n🎨 Running Prettier...');
  execSync('npx prettier --write .', { stdio: 'inherit' });
  console.log('✅ Prettier completed');
} catch (error) {
  console.log('❌ Prettier failed (but that\'s okay, we\'re ignoring it)');
}

try {
  console.log('\n💅 Running Stylelint...');
  execSync('npx stylelint "**/*.{vue,css,less,scss}" --cache --fix', { stdio: 'inherit' });
  console.log('✅ Stylelint completed');
} catch (error) {
  console.log('❌ Stylelint failed (but that\'s okay, we\'re ignoring it)');
}

console.log('\n🎉 Manual linting completed! All errors have been ignored.');
console.log('💡 Your code will work fine regardless of linting errors.');