// Entry point bridge for hosting platforms like Hostinger hPanel Node.js Selector / Passenger
const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(bundlePath)) {
  console.error(`[Hostinger Entry Error] Bundle not found at ${bundlePath}. Ensure 'npm run build' was executed.`);
  process.exit(1);
}

try {
  require(bundlePath);
} catch (err) {
  console.error('[Hostinger Entry Error] Failed to launch server bundle:', err);
  process.exit(1);
}
