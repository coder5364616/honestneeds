#!/usr/bin/env node

/**
 * Build script with memory optimization
 * This ensures NODE_OPTIONS are set correctly across all platforms
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Starting build with memory optimization...');
console.log('📊 Memory: 2GB');

// Set memory options for this process and child processes
process.env.NODE_OPTIONS = '--max-old-space-size=2048';

// Also set for the child process explicitly
const env = Object.assign({}, process.env, {
  NODE_OPTIONS: '--max-old-space-size=2048',
  NODE_ENV: 'production',
});

try {
  console.log('🚀 Running Next.js build...');
  execSync('next build', {
    stdio: 'inherit',
    env: env,
    cwd: process.cwd(),
  });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed!');
  console.error(error.message);
  process.exit(1);
}
