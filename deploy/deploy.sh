#!/usr/bin/env bash
# Build and release the site on the VPS with zero downtime.
# Usage (as the deploy user):  bash deploy/deploy.sh
set -euo pipefail

APP_DIR=/var/www/alphadentalmedia
REPO=https://github.com/zalalbd2008/React-Site-03.git
BRANCH=main
STAMP=$(date +%Y%m%d%H%M%S)
RELEASE="$APP_DIR/releases/$STAMP"

mkdir -p "$APP_DIR/releases"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$RELEASE"
cd "$RELEASE"
npm ci --no-audit --no-fund
VITE_SITE_URL=https://alphadentalmedia.com npm run build
npm prune --omit=dev --no-audit --no-fund

# Atomic switch: Nginx and the API now serve the new release
ln -sfn "$RELEASE" "$APP_DIR/current.tmp"
mv -Tf "$APP_DIR/current.tmp" "$APP_DIR/current"
sudo systemctl restart alpha-lead
sudo systemctl reload nginx

# Keep the 3 newest releases for quick rollback
ls -1dt "$APP_DIR"/releases/* | tail -n +4 | xargs -r rm -rf
echo "Deployed $STAMP"
