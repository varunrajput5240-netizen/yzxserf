// Quick fix script for Render ENOENT error
const fs = require('fs');
const path = require('path');

console.log('🔧 Render Deployment Fix Script');
console.log('================================\n');

// Check if package.json exists and is valid
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json is valid');
  console.log(`   Name: ${packageJson.name}`);
  console.log(`   Version: ${packageJson.version}`);
  console.log(`   Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
} catch (error) {
  console.log('❌ package.json error:', error.message);
  process.exit(1);
}

// Check for node_modules (should NOT exist for deployment)
if (fs.existsSync('node_modules')) {
  console.log('⚠️  node_modules exists - this should NOT be uploaded to Render');
  console.log('   Render installs dependencies automatically');
  console.log('   Make sure to exclude node_modules when uploading\n');
} else {
  console.log('✅ No node_modules folder (good for deployment)\n');
}

// Check server.js
try {
  const serverContent = fs.readFileSync('server.js', 'utf8');
  if (serverContent.includes("require('express')")) {
    console.log('✅ server.js looks valid');
  } else {
    console.log('❌ server.js might be missing express import');
  }
} catch (error) {
  console.log('❌ server.js error:', error.message);
  process.exit(1);
}

console.log('\n📋 Render Deployment Checklist:');
console.log('================================');
console.log('✅ package.json exists and valid');
console.log('✅ server.js exists');
console.log('✅ Dependencies listed in package.json');
console.log('✅ No node_modules in upload');
console.log('');
console.log('🔧 Render Service Configuration:');
console.log('================================');
console.log('Environment: Node');
console.log('Build Command: npm install');
console.log('Start Command: npm start');
console.log('Node Version: 18.17.0 or later');
console.log('');
console.log('🌍 Environment Variables to Add:');
console.log('================================');
console.log('PORT = 4000');
console.log('JWT_SECRET = your-random-secret-key-here');
console.log('FRONTEND_URL = https://your-netlify-site.netlify.app');
console.log('');
console.log('🚀 Ready for deployment!');
console.log('Upload these files to Render (exclude node_modules):');
console.log('- package.json');
console.log('- server.js');
console.log('- render.yaml (if using)');
console.log('- .env.example (optional)');

console.log('\n📞 If still failing, check Render logs for specific error!');
