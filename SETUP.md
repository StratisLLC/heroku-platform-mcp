# Heroku MCP — Guided Setup (type this, paste that)

This is the operator-facing walkthrough for deploying your own Heroku Platform MCP server.

Heroku assigns Button-deployed apps a **real hostname with a random suffix** (for example `https://my-heroku-mcp-819630210bc4.herokuapp.com`), and that hostname only exists **after** the app is created. So the correct order is **deploy first, then fix up the OAuth callback to match the real URL.** Follow it literally.

You need: the Heroku CLI installed and logged in (`heroku login`), and permission to create apps.

> ⚠️ The short `https://<app>.herokuapp.com` will **NOT** work for OAuth. Heroku rejects a callback that doesn't match the app's real (random-suffix) hostname. Always use the real Web URL from Step 3.

---

## Step 1 — Create the Heroku OAuth client (placeholder URL is fine for now)

This mints the `client_id` and `client_secret` the deploy form asks for. You don't know the app's real URL yet, so register a **placeholder** redirect URL now and correct it in Step 4:

    heroku clients:create "My Heroku MCP" https://example.com/oauth/callback

It prints an `id` and a `secret`. **Copy both now** — the secret is shown only once.

## Step 2 — Deploy

Click the Deploy to Heroku button (or use the Setup form). On the form:

- **App name:** pick any available name. (Heroku appends a random suffix to form the real hostname — that's expected.)
- **HEROKUMCP_OAUTH_CLIENT_ID:** paste the `id` from Step 1.
- **HEROKUMCP_OAUTH_CLIENT_SECRET:** paste the `secret` from Step 1.
- **HEROKUMCP_ADMIN_CONTACT:** your email.
- **HEROKUMCP_MASTER_KEY:** leave blank, it auto-generates.
- **HEROKUMCP_OAUTH_SCOPE:** leave as `identity,write-protected` for least-privilege (full platform tools, no usage/billing). Only type `global` if you want usage/billing AND your Heroku user is a billing/enterprise admin (see "Enabling usage" below).

Click Deploy and wait for it to finish.

## Step 3 — Get the app's REAL URL

After deploy, find the app's real Web URL — it has a random suffix:

- Heroku Dashboard → your app → **Open app**, or
- run `heroku apps:info -a <your-app>` and copy the **Web URL**.

It looks like `https://<your-app>-xxxxxxxxxxxx.herokuapp.com`. Use this real URL everywhere below. (The deploy logs also print these steps.)

## Step 4 — Point the OAuth client at the real URL

Update the client you created in Step 1 so its redirect URI matches the real host:

    heroku clients:update <paste-client-id-from-step-1> --url <REAL_URL>/oauth/callback

This replaces the Step 1 placeholder. The redirect URI must equal `<REAL_URL>/oauth/callback` exactly.

## Step 5 — Connect from Claude / Cursor and sign in

Add a custom connector with the real URL:

    <REAL_URL>/mcp

(or `<REAL_URL>/mcp-codemode`). Leave the connector's OAuth fields blank — Dynamic Client Registration handles them. A browser window opens for Heroku sign-in; approve, and you should land back without an error and get the full platform tool catalog.

---

## Enabling usage & billing (optional, requires admin role)

Usage and billing tools need **two** things, and both must be true:

1. The MCP must request the `global` scope, and
2. **Your Heroku user must be a billing/enterprise admin.**

The scope alone is not enough. If you are not a billing admin, enabling `global` will not let you see usage — the MCP will return "Forbidden" when it tries. Only do this if you are an admin.

To enable (use your app NAME for `-a`, not the URL):

    heroku config:set HEROKUMCP_OAUTH_SCOPE=global -a <your-app>

Then you MUST re-authenticate so a new token is minted at the new scope:

    # in a browser, using your REAL URL from Step 3:
    <REAL_URL>/sign-out
    <REAL_URL>/sign-in
    # then remove and re-add the connector in Claude

> Note the scope value is the single word `global`, not `identity,global` (Heroku rejects the combination).

To go back to least-privilege later: set `HEROKUMCP_OAUTH_SCOPE=identity,write-protected` and repeat the sign-out / sign-in / reconnect.

---

## If something goes wrong

- **Callback error / redirect mismatch / sign-in 404:** the OAuth client's redirect URI must match the app's **real** URL (the one with the random suffix), not the short `<app>.herokuapp.com`. Get the real Web URL (Step 3) and re-run Step 4: `heroku clients:update <client_id> --url <REAL_URL>/oauth/callback`.
- **Sign-in shows "Couldn't find that user" (404):** the token lacks the `identity` scope. Confirm `HEROKUMCP_OAUTH_SCOPE` is `identity,write-protected` or `global` (never bare `write-protected`), then sign out and in again.
- **Sign-in doesn't bounce to id.heroku.com:** you may have a stale session. Open `<REAL_URL>/sign-out` first, then `<REAL_URL>/sign-in`.
- **Connector returns 401 repeatedly:** sign out, sign in, then remove and re-add the connector. A fresh sign-in mints a fresh Heroku token.
- **A usage tool returns "Forbidden":** you are on `global` but your Heroku user is not a billing/enterprise admin. That permission is required and can't be granted by the app.
