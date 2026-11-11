#!/usr/bin/env bash
# Deploy dist/ to preview.agent-gen.ca ONLY. Never touches nginx, TLS, the apex, or services.
set -euo pipefail
HOST="${DEPLOY_HOST:-nostr@76.13.103.104}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/vps_buzz}"
ROOT="/var/www/preview.agent-gen.ca/"
[ -f dist/index.html ] || { echo "dist/ missing: run npm run build first" >&2; exit 1; }
grep -q 'content="noindex,nofollow"' dist/index.html || { echo "refusing: dist is not a noindex preview build" >&2; exit 1; }
SSH="ssh -i $KEY -o BatchMode=yes -o ConnectTimeout=20"
if ! $SSH "$HOST" "test -w '$ROOT'"; then
  echo "BLOCKED: $HOST cannot write to $ROOT (owned by root). Ask the VPS owner to grant write access (e.g. a deploy group); not using sudo." >&2
  exit 3
fi
# Keep .well-known (ACME challenges) untouched; delete only stale build files.
rsync -rlvz --delete --exclude='.well-known/' --chmod=D755,F644 -e "$SSH" dist/ "$HOST:$ROOT"
echo "deployed to https://preview.agent-gen.ca/"
