#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');




console.log('🚀 Building optimized Chrome extension...\n');

// Step 1: Clean previous build
console.log('📁 Cleaning previous build...');
if (fs.existsSync('build')) {
  execSync('rm -rf build', { stdio: 'inherit' });
}

// Step 2: Build with optimizations
console.log('⚡ Building with craco optimizations...');
execSync('GENERATE_SOURCEMAP=false npm run build:prod', { stdio: 'inherit' });


// Step 3: Analyze bundle size
console.log('\n📊 Bundle Analysis:');
const buildDir = 'build';
const stats = [];

function analyzeDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      analyzeDirectory(itemPath, prefix + item + '/');
    } else {
      const size = stat.size;
      const sizeKB = (size / 1024).toFixed(2);
      stats.push({ path: prefix + item, size: sizeKB });
    }
  });
}

analyzeDirectory(buildDir);

// Sort by size
stats.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

// Display top files
console.log('\n📈 Largest files:');
stats.slice(0, 10).forEach(file => {
  console.log(`  ${file.size}KB - ${file.path}`);
});

// Calculate total size
const totalSize = stats.reduce((sum, file) => sum + parseFloat(file.size), 0);
console.log(`\n📦 Total extension size: ${totalSize.toFixed(2)}KB (${(totalSize / 1024).toFixed(2)}MB)`);

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
if (totalSize > 1000) {
  console.log('  ⚠️  Extension is still large. Consider:');
  console.log('     - Further code splitting');
  console.log('     - Image compression');
  console.log('     - Removing unused dependencies');
} else if (totalSize > 500) {
  console.log('  ✅ Good size! Consider minor optimizations.');
} else {
  console.log('  🎉 Excellent! Extension is well optimized.');
}

console.log('\n✨ Build complete! Extension ready for Chrome.');
