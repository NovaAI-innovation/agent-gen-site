#!/usr/bin/env bash
# Deploy dist/ to preview.agent-gen.ca ONLY. Never touches nginx, TLS, the apex, or services.
set -euo pipefail
HOST="${DEPLOY_HOST:-nostr@76.13.103.104}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/vps_buzz}"
ROOT="/var/www/preview.agent-gen.ca/"
[ -f dist/index.html ] || { echo "dist/ missing: run npm run build first" >&2; exit 1; }
grep -q 'content="noindex,nofollow"' dist/index.html || { echo "refusing: dist is not a noindex preview build" >&2; exit 1; }
SSH="ssh -i $KEY -o BatchMode=yes -o ConnectTimeout=20"
set +e
$SSH "$HOST" "test -w '$ROOT'"; rc=$?
set -e
if [ $rc -eq 255 ]; then echo "BLOCKED: SSH to $HOST failed (connection/auth)." >&2; exit 2; fi
if [ $rc -ne 0 ]; then
  echo "BLOCKED: $HOST cannot write to $ROOT. Ask the VPS owner to grant write access (e.g. a deploy group); not using sudo." >&2
  exit 3
fi
# Keep .well-known (ACME challenges) untouched; delete only stale build files.
if command -v rsync >/dev/null; then
  rsync -rlvz --delete --exclude='.well-known/' --chmod=D755,F644 -e "$SSH" dist/ "$HOST:$ROOT"
else
  # One SSH connection (port 22 rate-limits bursts): clear old files except .well-known, then unpack.
  tar -C dist -czf - . | $SSH "$HOST" "set -e; cd '$ROOT'; find . -mindepth 1 -maxdepth 1 ! -name .well-known -exec rm -rf {} +; tar -xzf - --no-same-owner; find . -path ./.well-known -prune -o -type d -exec chmod 755 {} + -o -type f -exec chmod 644 {} +"
fi
echo "deployed to https://preview.agent-gen.ca/"
