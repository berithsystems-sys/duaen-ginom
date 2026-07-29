// Entry point bridge for hosting platforms like Hostinger hPanel Node.js Selector / Express Preset
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

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



