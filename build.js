#!/usr/bin/env node

/**
 * Build script with memory optimization and comprehensive error capture
 * This ensures NODE_OPTIONS are set correctly across all platforms
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('🔨 Starting build with memory optimization...');
console.log('📊 Memory: 2GB');
console.log('📍 Environment:', process.env.RENDER ? 'Render' : 'Local');
console.log('🖥️  Platform:', process.platform);
console.log('📝 Node version:', process.version);

// Ensure NODE_OPTIONS is set for build (override any existing value)
// This is critical for the build process
const env = Object.assign({}, process.env);
delete env.NODE_OPTIONS; // Clear any existing setting
env.NODE_OPTIONS = '--max-old-space-size=2048';
env.NODE_ENV = 'production';
env.NEXT_TELEMETRY_DISABLED = '1';

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
let timeoutId = null;

const build = spawn('next', ['build'], {
  env: env,
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'pipe'], // Separate stdout and stderr
  shell: false,
  detached: false,
  timeout: buildTimeout,
});

let stdout = '';
let stderr = '';

// Pipe stdout to console AND capture it
if (build.stdout) {
  build.stdout.on('data', (data) => {
    const text = data.toString();
    stdout += text;
    process.stdout.write(text);
  });
}

// Pipe stderr to console AND capture it
if (build.stderr) {
  build.stderr.on('data', (data) => {
    const text = data.toString();
    stderr += text;
    process.stderr.write(text);
  });
}

// Set timeout
timeoutId = setTimeout(() => {
  console.error('\n---');
  console.error('❌ Build timeout! Process exceeded 30 minutes.');
  try {
    process.kill(-build.pid); // Kill process group
  } catch (e) {
    // Ignore
  }
  process.exit(1);
}, buildTimeout);

build.on('error', (error) => {
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Failed to start build process!');
  console.error('Error:', error.message);
  if (stderr) {
    console.error('\n📋 Stderr output:', stderr);
  }
  process.exit(1);
});

build.on('exit', (code, signal) => {
  if (timeoutId) clearTimeout(timeoutId);
  console.log('---');
  
  if (code === 0 || code === null) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`❌ Build failed!`);
    console.error(`   Exit code: ${code}`);
    if (signal) {
      console.error(`   Signal: ${signal}`);
    }
    
    if (stderr) {
      console.error('\n📋 Error output:');
      console.error(stderr);
    }
    
    if (stdout && stderr === '') {
      // If there's stdout but no stderr, the issue might be in the output itself
      console.error('\n📋 Last output lines:');
      console.error(stdout.split('\n').slice(-20).join('\n'));
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check backend API connectivity: ' + (process.env.NEXT_PUBLIC_API_URL || 'https://honestneeds-backend-rkrv.onrender.com/api'));
    console.error('   2. Verify all required environment variables are set');
    console.error('   3. Check available disk space and memory');
    console.error('   4. Try running locally: npm run build');
    console.error('   5. Review the full error output above');
    
    process.exit(code || 1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Uncaught exception during build:');
  console.error(error.stack || error);
  if (stderr) {
    console.error('\nStderr:', stderr);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Unhandled promise rejection during build:');
  console.error(reason);
  process.exit(1);
});




