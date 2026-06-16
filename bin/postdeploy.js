#!/usr/bin/env node
const https = require('node:https');

const appName = process.env.HEROKU_APP_NAME;
const apiKey = process.env.HEROKU_API_KEY;
const publicUrl = `https://${appName}.herokuapp.com`;

async function setConfigVar(key, value) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ [key]: value });
    const req = https.request(
      {
        method: 'PATCH',
        host: 'api.heroku.com',
        path: `/apps/${appName}/config-vars`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.heroku+json; version=3',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Heroku API ${res.statusCode}: ${data}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // NOTE(operator): HEROKU_API_KEY is NOT automatically injected into postdeploy
  // dynos for Heroku Button deploys (confirmed via Heroku docs — it is only
  // present if explicitly set/inherited as a config var). So in the common case
  // this script falls through to printing the manual `heroku config:set` command.
  // That's expected and harmless; the server tolerates HEROKUMCP_PUBLIC_URL being
  // unset for the duration between deploy and the user running that command.
  if (!appName || !apiKey) {
    console.error('postdeploy: HEROKU_APP_NAME or HEROKU_API_KEY not set; skipping auto-config.');
    console.error('postdeploy: Manually set HEROKUMCP_PUBLIC_URL with: heroku config:set HEROKUMCP_PUBLIC_URL=https://<your-app>.herokuapp.com');
  } else {
    try {
      await setConfigVar('HEROKUMCP_PUBLIC_URL', publicUrl);
      console.error(`postdeploy: HEROKUMCP_PUBLIC_URL set to ${publicUrl}`);
    } catch (err) {
      console.error(`postdeploy: failed to set HEROKUMCP_PUBLIC_URL automatically: ${err.message}`);
      console.error(`postdeploy: please run manually: heroku config:set HEROKUMCP_PUBLIC_URL=${publicUrl} -a ${appName}`);
    }
  }

  console.error('');
  console.error('============================================================');
  console.error('  Heroku Platform MCP — Deploy Complete');
  console.error('============================================================');
  console.error('');
  console.error(`  Server URL:  ${publicUrl}`);
  console.error(`  MCP endpoint:  ${publicUrl}/mcp`);
  console.error('');
  console.error('  Next steps:');
  console.error(`  1. If your Heroku OAuth client's redirect URI does not match ${publicUrl}/oauth/callback,`);
  console.error(`     update it now:   heroku clients:update <client-id> --url ${publicUrl}/oauth/callback`);
  console.error('  2. In Claude Desktop: Settings → Connectors → Add custom connector');
  console.error(`     URL:  ${publicUrl}/mcp`);
  console.error('     Leave OAuth client fields blank — Dynamic Client Registration handles it.');
  console.error('  3. Sign in via the OAuth flow when Claude Desktop opens your browser.');
  console.error('');
  console.error('============================================================');
}

main().catch((err) => {
  console.error('postdeploy: unexpected error', err);
  process.exit(1);
});
