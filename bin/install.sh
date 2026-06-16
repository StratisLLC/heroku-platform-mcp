#!/usr/bin/env bash
set -euo pipefail

# Build script for the heroku-platform-mcp deploy repo.
# Clones StratisLLC/heroku-platform-mcp-server at $SOURCE_TAG and builds it.

SOURCE_TAG="${SOURCE_TAG:-http-server-v0.2.3}"
PNPM_VERSION="${PNPM_VERSION:-9.15.9}"

START=$SECONDS

echo "==> Installing pnpm@${PNPM_VERSION}"
npm install -g "pnpm@${PNPM_VERSION}"

echo "==> Cloning heroku-platform-mcp-server @ ${SOURCE_TAG}"
rm -rf source
git clone --depth 1 --branch "${SOURCE_TAG}" \
  https://github.com/StratisLLC/heroku-platform-mcp-server.git source

echo "==> Installing dependencies"
cd source
# --prod=false is required even though app.json no longer sets NODE_ENV=production.
# The heroku/nodejs buildpack sets NODE_ENV=production as a default in the build
# environment regardless of what app.json declares, which causes pnpm to prune
# devDependencies. The source repo's build (tsup/typescript) needs those dev deps,
# so without --prod=false the build fails with "spawn ENOENT" trying to run tsup.
pnpm install --frozen-lockfile --prod=false

echo "==> Building all packages"
pnpm -r build

ELAPSED=$((SECONDS - START))
echo "==> Build complete (source tag: ${SOURCE_TAG}, pnpm: ${PNPM_VERSION}, duration: ${ELAPSED}s)"
