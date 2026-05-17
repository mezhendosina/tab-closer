#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY="$ROOT/key.pem"

if [[ -f "$KEY" ]]; then
  echo "Already exists: $KEY"
  exit 1
fi

openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out "$KEY"
chmod 600 "$KEY"

echo "Created $KEY"
echo
echo "Add GitHub secret CRX_PRIVATE_KEY (one line, no wraps):"
if [[ "$(uname)" == "Darwin" ]]; then
  base64 -i "$KEY" | tr -d '\n'
else
  base64 -w0 "$KEY"
fi
echo
