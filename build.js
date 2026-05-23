#!/usr/bin/env node

/**
 * Build script with memory optimization and timeout handling
 * This ensures NODE_OPTIONS are set correctly across all platforms
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🔨 Starting build with memory optimization...');
console.log('📊 Memory: 2GB');
console.log('📍 Environment:', process.env.RENDER ? 'Render' : 'Local');
console.log('🖥️  Platform:', process.platform);
console.log('📝 Node version:', process.version);

// Set memory options for this process and child processes
const env = Object.assign({}, process.env, {
  NODE_OPTIONS: '--max-old-space-size=2048',
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1', // Disable telemetry to speed up build
});

// Log available memory (if running on Linux/Unix)
if (process.platform !== 'win32') {
  try {
    const memInfo = os.totalmem();
    console.log('💾 Total system memory:', Math.round(memInfo / 1024 / 1024 / 1024), 'GB');
  } catch (e) {
    // Ignore
  }
}

console.log('🚀 Running: next build');
console.log('---');

// Set a timeout for the entire build process (30 minutes)
const buildTimeout = 30 * 60 * 1000;
const timeoutHandle = setTimeout(() => {
  console.error('\n---');
  console.error('❌ Build timeout! Process exceeded 30 minutes.');
  process.exit(1);
}, buildTimeout);

const build = spawn('next', ['build'], {
  env: env,
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  timeout: buildTimeout,
});

build.on('error', (error) => {
  clearTimeout(timeoutHandle);
  console.error('\n---');
  console.error('❌ Failed to start build process!');
  console.error('Error:', error.message);
  process.exit(1);
});

build.on('exit', (code, signal) => {
  clearTimeout(timeoutHandle);
  console.log('---');
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`❌ Build failed!`);
    console.error(`   Exit code: ${code}`);
    if (signal) {
      console.error(`   Signal: ${signal}`);
    }
    console.error('\n💡 Tips for debugging:');
    console.error('   1. Check if the backend API is accessible');
    console.error('   2. Verify all environment variables are set');
    console.error('   3. Check available disk space and memory');
    console.error('   4. Try running locally: npm run build');
    process.exit(code || 1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  clearTimeout(timeoutHandle);
  console.error('\n---');
  console.error('❌ Uncaught exception during build:');
  console.error(error.stack || error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  clearTimeout(timeoutHandle);
  console.error('\n---');
  console.error('❌ Unhandled promise rejection during build:');
  console.error(reason);
  process.exit(1);
});



