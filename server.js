// Entry point bridge for hosting platforms like Hostinger hPanel Node.js Selector / Passenger
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');
const indexPath = path.join(__dirname, 'dist', 'index.html');

// If build outputs are missing, trigger build automatically
if (!fs.existsSync(bundlePath) || !fs.existsSync(indexPath)) {
  console.log('[Hostinger Bridge] Build output missing. Running npm run build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.error('[Hostinger Bridge] Build failed:', err);
  }
}

if (!fs.existsSync(bundlePath)) {
  console.error(`[Hostinger Entry Error] Bundle not found at ${bundlePath}. Ensure build succeeds.`);
  process.exit(1);
}

try {
  require(bundlePath);
} catch (err) {
  console.error('[Hostinger Entry Error] Failed to launch server bundle:', err);
  process.exit(1);
}

