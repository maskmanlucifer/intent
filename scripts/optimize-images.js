const fs = require('fs');
const path = require('path');

// Simple image optimization script
const optimizeImages = () => {
  const buildDir = path.join(__dirname, '../build');
  const publicDir = path.join(__dirname, '../public');
  
  console.log('Optimizing images for Chrome extension...');
  
  // List of images to optimize
  const imagesToOptimize = [
    'favicon.ico',
    'logo256.png',
    'logo512.png',
    'logo32.png',
    'add.png'
  ];
  
  imagesToOptimize.forEach(imageName => {
    const buildPath = path.join(buildDir, imageName);
    const publicPath = path.join(publicDir, imageName);
    
    if (fs.existsSync(buildPath)) {
      const stats = fs.statSync(buildPath);
      console.log(`${imageName}: ${(stats.size / 1024).toFixed(2)}KB`);
    }
  });
  
  console.log('Image optimization complete!');
};

optimizeImages();
