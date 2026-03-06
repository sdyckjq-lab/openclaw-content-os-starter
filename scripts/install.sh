#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/bootstrap/install.mjs" ]; then
  exec node "$SCRIPT_DIR/bootstrap/install.mjs" "$@"
fi

REPO_SLUG="${OPENCLAW_CONTENT_OS_REPO:-sdyckjq-lab/openclaw-content-os-starter}"
BRANCH="${OPENCLAW_CONTENT_OS_BRANCH:-main}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

ARCHIVE_URL="https://codeload.github.com/${REPO_SLUG}/tar.gz/refs/heads/${BRANCH}"
curl -fsSL "$ARCHIVE_URL" | tar -xz -C "$TMP_DIR"

REPO_ROOT="$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"

if [ ! -f "$REPO_ROOT/scripts/bootstrap/install.mjs" ]; then
  echo "Downloaded repo does not contain scripts/bootstrap/install.mjs" >&2
  exit 1
fi

exec node "$REPO_ROOT/scripts/bootstrap/install.mjs" "$@"
