#!/usr/bin/env node
// Post-deploy guidance for Heroku Button deploys.
//
// Heroku serves Button-deployed apps at a LONG hostname with a random suffix
// (e.g. https://<app>-xxxxxxxxxxxx.herokuapp.com). That real hostname is NOT
// available to this script: HEROKU_APP_DEFAULT_DOMAIN_NAME is empty in this
// environment, and Button deploys do not inject HEROKU_API_KEY — so we can
// neither derive the real URL nor set it via the Platform API. We deliberately
// do NOT set HEROKUMCP_PUBLIC_URL to the short host (that would be wrong and is
// the cause of the OAuth callback 404). The server self-resolves its real
// public URL from the inbound x-forwarded-host header at request time, so
// PUBLIC_URL never needs to be set. This script's job is to print the
// DEPLOY-THEN-FIXUP steps the operator runs once the real URL is known.

const appName = process.env.HEROKU_APP_NAME;
const appInfoCmd = appName ? `heroku apps:info -a ${appName}` : 'heroku apps:info -a <your-app>';

console.error('');
console.error('============================================================');
console.error('  Heroku Platform MCP — Deploy Complete');
console.error('============================================================');
console.error('');
console.error("  IMPORTANT: this app's real URL has a RANDOM SUFFIX, e.g.");
console.error('  https://<app>-xxxxxxxxxxxx.herokuapp.com');
console.error('  The short https://<app>.herokuapp.com will NOT work for OAuth.');
console.error('  Use the real URL everywhere below.');
console.error('');
console.error('  Finish setup (deploy-then-fixup):');
console.error('');
console.error("  1. Get this app's REAL Web URL:");
console.error('       Heroku Dashboard -> your app -> "Open app", or run:');
console.error(`       ${appInfoCmd}      (copy the "Web URL")`);
console.error('');
console.error('  2. Point your OAuth client at that real URL. Use the client_id you');
console.error('     created before deploy (this replaces the placeholder redirect URL):');
console.error('       heroku clients:update <YOUR_CLIENT_ID> --url <REAL_URL>/oauth/callback');
console.error('');
console.error('  3. Connect from Claude/Cursor:');
console.error('       Settings -> Connectors -> Add custom connector');
console.error('       URL:  <REAL_URL>/mcp      (or <REAL_URL>/mcp-codemode)');
console.error('       Leave the connector OAuth fields blank — DCR handles it. Then sign in.');
console.error('');
console.error('============================================================');
