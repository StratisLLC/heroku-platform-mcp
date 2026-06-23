# Heroku MCP — Guided Setup (type this, paste that)

This is the operator-facing walkthrough for deploying your own Heroku Platform MCP server. It removes the OAuth-client chicken-and-egg by doing the steps in the right order: **pick the name first, create the client second, deploy third, reconcile fourth.** Follow it literally.

You need: the Heroku CLI installed and logged in (`heroku login`), and permission to create apps.

---

## Step 1 — Choose your app name (do this first)

Pick a unique name now. Everything else is built from it. Example used below: `my-heroku-mcp`. Replace `my-heroku-mcp` with your name everywhere it appears.

Check it's available:

    heroku apps:info -a my-heroku-mcp

If it says "Couldn't find that app," the name is free. Good. If it shows an app, pick another name.

Your app's URL will be:

    https://my-heroku-mcp.herokuapp.com

Your OAuth callback URL will be:

    https://my-heroku-mcp.herokuapp.com/oauth/callback

> Optional, recommended for a stable demo: if you'll put a custom domain on this later, decide it now and use that hostname in place of `my-heroku-mcp.herokuapp.com` throughout. The callback must match wherever the app actually answers.

## Step 2 — Create the Heroku OAuth client

This mints the `CLIENT_ID` and `CLIENT_SECRET` the deploy form asks for. Run exactly this, with your callback URL from Step 1:

    heroku clients:create "My Heroku MCP" https://my-heroku-mcp.herokuapp.com/oauth/callback

It prints an `id` and a `secret`. **Copy both now** — the secret is shown once. Keep them somewhere for the next step.

## Step 3 — Deploy

Click the Deploy to Heroku button (or use the Setup form). On the form:

- **App name:** type the exact name from Step 1 (`my-heroku-mcp`). This must match, or the callback URL won't line up.
- **HEROKUMCP_OAUTH_CLIENT_ID:** paste the `id` from Step 2.
- **HEROKUMCP_OAUTH_CLIENT_SECRET:** paste the `secret` from Step 2.
- **HEROKUMCP_ADMIN_CONTACT:** your email.
- **HEROKUMCP_MASTER_KEY:** leave blank, it auto-generates.
- **HEROKUMCP_OAUTH_SCOPE:** leave as `identity,write-protected` for least-privilege (full platform tools, no usage/billing). Only type `global` if you want usage/billing AND your Heroku user is a billing/enterprise admin. See "Enabling usage" below.
- **HEROKUMCP_PUBLIC_URL:** leave blank, handled next.

Click Deploy and wait for it to finish.

## Step 4 — Set the public URL

Run exactly this (your app name):

    heroku config:set HEROKUMCP_PUBLIC_URL=https://my-heroku-mcp.herokuapp.com -a my-heroku-mcp

> Why: the server can infer its URL from traffic, but on a custom domain or to be safe, set it explicitly. This avoids a class of callback-mismatch problems.

## Step 5 — Confirm the callback URL matches

The OAuth client's redirect URI (Step 2) must exactly equal `<your public URL>/oauth/callback`. If you used the matching name throughout, it already does. To be certain, update it (harmless if unchanged):

    heroku clients:update <paste-client-id-from-step-2> --url https://my-heroku-mcp.herokuapp.com/oauth/callback

## Step 6 — Sign in

Open this in a browser:

    https://my-heroku-mcp.herokuapp.com/sign-in

It should bounce you to **id.heroku.com**. Approve there. You should land back on your app without an error. (Seeing the Heroku approval screen is how you know it worked.)

## Step 7 — Connect from Claude

Add a custom connector in Claude with this URL:

    https://my-heroku-mcp.herokuapp.com/mcp-codemode

Approve once. You should get the full platform tool catalog.

---

## Enabling usage & billing (optional, requires admin role)

Usage and billing tools need **two** things, and both must be true:

1. The MCP must request the `global` scope, and
2. **Your Heroku user must be a billing/enterprise admin.**

The scope alone is not enough. If you are not a billing admin, enabling `global` will not let you see usage — the MCP will return "Forbidden" when it tries. Only do this if you are an admin.

To enable:

    heroku config:set HEROKUMCP_OAUTH_SCOPE=global -a my-heroku-mcp

Then you MUST re-authenticate so a new token is minted at the new scope:

    # in a browser:
    https://my-heroku-mcp.herokuapp.com/sign-out
    https://my-heroku-mcp.herokuapp.com/sign-in
    # then remove and re-add the connector in Claude

> Note the scope value is the single word `global`, not `identity,global` (Heroku rejects the combination).

To go back to least-privilege later: set `HEROKUMCP_OAUTH_SCOPE=identity,write-protected` and repeat the sign-out / sign-in / reconnect.

---

## If something goes wrong

- **Sign-in shows "Couldn't find that user" (404):** the token lacks the `identity` scope. Confirm `HEROKUMCP_OAUTH_SCOPE` is `identity,write-protected` or `global` (never bare `write-protected`), then sign out and in again.
- **Sign-in doesn't bounce to id.heroku.com:** you may have a stale session. Open `/sign-out` first, then `/sign-in`.
- **Connector returns 401 repeatedly:** sign out, sign in, then remove and re-add the connector. A fresh sign-in mints a fresh Heroku token.
- **A usage tool returns "Forbidden":** you are on `global` but your Heroku user is not a billing/enterprise admin. That permission is required and can't be granted by the app.
- **Callback error / redirect mismatch:** the OAuth client's redirect URI and `HEROKUMCP_PUBLIC_URL` must agree, both `https://<your-app>/oauth/callback`. Re-run Steps 4 and 5.
