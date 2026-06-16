# Heroku Platform MCP — Deploy

This is the **Heroku Button deploy wrapper** for [`StratisLLC/heroku-platform-mcp-server`](https://github.com/StratisLLC/heroku-platform-mcp-server).

It's a thin shell: an `app.json` describing the deploy form, plus a small install script that clones the source repo at a pinned tag and builds it. The actual MCP server code lives in the source repo.

## Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/StratisLLC/heroku-platform-mcp/tree/main)

Before clicking, provision a Heroku OAuth client (the deploy form needs the credentials). See [OAuth setup](https://github.com/StratisLLC/heroku-platform-mcp-server/blob/main/docs/OAUTH-SETUP.md) for the walkthrough.

## What this repo contains

- `app.json` — Heroku deploy form, addon and dyno definitions, and `SOURCE_TAG` pin
- `bin/install.sh` — runs at build time; clones the source repo at `SOURCE_TAG` and installs/builds it
- `Procfile` — the runtime entrypoint (`web` dyno runs `node packages/http-server/dist/bin.js`)
- `package.json` — minimal manifest used only by the buildpack

## Bumping the version

To ship a new release to customers deploying via the Button:

1. Tag a new release in the source repo (e.g. `v1.2.0`)
2. Wait for npm publish workflow to complete
3. Update `app.json` in this repo: change `"SOURCE_TAG"` to the new tag value
4. Commit and push to `main`

New Button deploys will pull the new tag automatically. Existing Heroku apps continue running their installed version until they're individually redeployed.

## Documentation and source

All documentation, source code, and detailed information lives in [`StratisLLC/heroku-platform-mcp-server`](https://github.com/StratisLLC/heroku-platform-mcp-server). This repo is intentionally minimal — its only purpose is to be the Heroku Button entry point.

---

<sub>Published by <strong>Stratis, LLC</strong>. Licensed under Apache-2.0.</sub>

<sub>Salesforce and the Salesforce logo are trademarks of Salesforce, Inc. Heroku and the Heroku logo are trademarks of Salesforce, Inc. This is an independent open-source project and is not affiliated with, endorsed by, or sponsored by Salesforce.</sub>
