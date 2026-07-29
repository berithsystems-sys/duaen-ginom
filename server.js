// Entry point bridge for hosting platforms like Hostinger hPanel Node.js Selector / Passenger
const fs = require('fs');
const path = require('path');
const http = require('http');

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');

let appLoaded = false;

if (fs.existsSync(bundlePath)) {
  try {
    module.exports = require(bundlePath);
    appLoaded = true;
  } catch (err) {
    console.error('[Hostinger Entry Error] Exception loading dist/server.cjs:', err);
    startFallbackServer(`
      <h1 style="color: #ef4444; margin-bottom: 12px;">Hostinger Application Exception</h1>
      <p style="margin-bottom: 16px;">The application bundle <code>dist/server.cjs</code> failed to launch:</p>
      <pre style="background: #1e293b; color: #f87171; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; text-align: left;">${err.stack || err.message || err}</pre>
    `);
  }
} else {
  console.error(`[Hostinger Entry Error] Bundle not found at ${bundlePath}.`);
  startFallbackServer(`
    <h1 style="color: #f59e0b; margin-bottom: 12px;">Build Artifact Missing (dist/server.cjs)</h1>
    <p style="margin-bottom: 16px;">The file <code>dist/server.cjs</code> was not found on the host filesystem.</p>
    <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 20px;">
      <p style="color: #38bdf8; font-weight: bold; margin-bottom: 8px;">To resolve this on Hostinger:</p>
      <ol style="margin-left: 20px; line-height: 1.6; color: #e2e8f0;">
        <li>Open your Hostinger <strong>Node.js / Terminal</strong> tab or SSH into your host.</li>
        <li>Run: <code>npm run build</code></li>
        <li>Click <strong>Restart Application</strong> in hPanel.</li>
      </ol>
    </div>
  `);
}

function startFallbackServer(htmlBody) {
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AutoDoc Rec Studio - Diagnostic Notice</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background: #0f172a; color: #f8fafc; max-width: 720px; margin: 0 auto; text-align: center;">
          <div style="background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
            ${htmlBody}
            <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 13px;">AutoDoc Rec Studio - Hostinger Deployment Diagnostic</p>
          </div>
        </body>
      </html>
    `);
  });

  const rawPort = process.env.PORT || 3000;
  if (typeof rawPort === 'string' && isNaN(Number(rawPort))) {
    server.listen(rawPort, () => {
      console.log(`[Hostinger Fallback Server] Listening on socket/pipe ${rawPort}`);
    });
  } else {
    const numericPort = Number(rawPort) || 3000;
    server.listen(numericPort, () => {
      console.log(`[Hostinger Fallback Server] Listening on port ${numericPort}`);
    });
  }

  module.exports = server;
}


