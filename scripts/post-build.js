const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try loading .env.local first, then .env
const envFiles = ['.env.local', '.env'];
let loaded = false;

envFiles.forEach(file => {
    const envPath = path.resolve(__dirname, `../${file}`);
    if (fs.existsSync(envPath)) {
        const result = dotenv.config({ path: envPath });
        if (!result.error) {
            console.log(`✅ Loaded ${file}`);
            loaded = true;
        }
    }
});

if (!loaded) {
    console.log('⚠️ No .env or .env.local file found.');
}

console.log('🔧 Configuring background script...');
const backgroundPath = path.join('build', 'background.js');
if (fs.existsSync(backgroundPath)) {
    let content = fs.readFileSync(backgroundPath, 'utf8');
    const ogFetcherUrl = process.env.REACT_APP_OG_FETCHER_URL || '';

    if (content.includes('__REACT_APP_OG_FETCHER_URL__')) {
        content = content.replace('__REACT_APP_OG_FETCHER_URL__', ogFetcherUrl);
        fs.writeFileSync(backgroundPath, content);
        console.log(`✅ Replaced placeholder with ${ogFetcherUrl}`);
    } else {
        console.log('ℹ️ Placeholder not found (already replaced?)');
    }
} else {
    console.log('⚠️ Background script not found at:', backgroundPath);
}
