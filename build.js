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
console.log('📂 CWD:', process.cwd());

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
let buildStartTime = Date.now();

// Add activity logging
let lastActivityTime = Date.now();
const activityCheckInterval = setInterval(() => {
  const elapsed = ((Date.now() - buildStartTime) / 1000).toFixed(1);
  const sinceActivity = ((Date.now() - lastActivityTime) / 1000).toFixed(1);
  console.log(`[${elapsed}s] Build in progress... (no output for ${sinceActivity}s)`);
}, 10000); // Log every 10 seconds

const build = spawn('next', ['build'], {
  env: env,
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'], // Separate stdout and stderr
  shell: false,
  detached: false,
});

let stdout = '';
let stderr = '';
let lastLine = '';

// Pipe stdout to console AND capture it
if (build.stdout) {
  build.stdout.on('data', (data) => {
    lastActivityTime = Date.now();
    const text = data.toString();
    stdout += text;
    lastLine = text.split('\n').filter(l => l.trim()).pop() || lastLine;
    process.stdout.write(text);
  });
}

// Pipe stderr to console AND capture it  
if (build.stderr) {
  build.stderr.on('data', (data) => {
    lastActivityTime = Date.now();
    const text = data.toString();
    stderr += text;
    lastLine = text.split('\n').filter(l => l.trim()).pop() || lastLine;
    process.stderr.write(text);
  });
}

// Set timeout
timeoutId = setTimeout(() => {
  clearInterval(activityCheckInterval);
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
  clearInterval(activityCheckInterval);
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Failed to start build process!');
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
  if (stderr) {
    console.error('\n📋 Stderr:', stderr);
  }
  process.exit(1);
});

build.on('exit', (code, signal) => {
  clearInterval(activityCheckInterval);
  if (timeoutId) clearTimeout(timeoutId);
  
  const elapsed = ((Date.now() - buildStartTime) / 1000).toFixed(1);
  console.log('---');
  
  if (code === 0 || code === null) {
    console.log(`✅ Build completed successfully in ${elapsed}s!`);
    process.exit(0);
  } else {
    console.error(`❌ Build failed after ${elapsed}s!`);
    console.error(`   Exit code: ${code}`);
    if (signal) {
      console.error(`   Signal: ${signal}`);
    }
    
    if (stderr) {
      console.error('\n📋 Stderr output:');
      console.error(stderr);
    } else {
      console.error('\n⚠️  No error output captured on stderr');
    }
    
    if (lastLine) {
      console.error('\n📋 Last line before exit:');
      console.error('   ', lastLine);
    }
    
    if (stdout) {
      console.error('\n📋 Last 30 lines of build output:');
      const lines = stdout.split('\n');
      console.error(lines.slice(-30).join('\n'));
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   • Build completes but crashes during page generation');
    console.error('   • Check if a page is causing the crash');
    console.error('   • Verify backend API is accessible');
    console.error('   • Run locally: npm run build');
    console.error('   • Check disk space and memory');
    
    process.exit(code || 1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  clearInterval(activityCheckInterval);
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Uncaught exception during build:');
  console.error(error.stack || error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  clearInterval(activityCheckInterval);
  if (timeoutId) clearTimeout(timeoutId);
  console.error('\n---');
  console.error('❌ Unhandled promise rejection during build:');
  console.error(reason);
  process.exit(1);
});
