#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
SANDBOX_ROOT="${OPENCLAW_CONTENT_OS_SANDBOX_ROOT:-$HOME/Documents/openclaw-content-os-sandbox-$STAMP}"
OPENCLAW_HOME_SANDBOX="$SANDBOX_ROOT/openclaw-home"
CONTENT_OS_HOME_SANDBOX="$SANDBOX_ROOT/content-data"
GATEWAY_PORT_SANDBOX="${OPENCLAW_CONTENT_OS_GATEWAY_PORT:-18891}"
ENTER_SCRIPT="$SANDBOX_ROOT/enter-sandbox.sh"

mkdir -p "$OPENCLAW_HOME_SANDBOX" "$CONTENT_OS_HOME_SANDBOX"

cat > "$ENTER_SCRIPT" <<EOF
export OPENCLAW_HOME="$OPENCLAW_HOME_SANDBOX"
export CONTENT_OS_HOME="$CONTENT_OS_HOME_SANDBOX"
export OPENCLAW_CONTENT_OS_SANDBOX=1
export OPENCLAW_CONTENT_OS_GATEWAY_PORT="$GATEWAY_PORT_SANDBOX"
EOF

chmod +x "$ENTER_SCRIPT"

printf 'Sandbox root: %s\n' "$SANDBOX_ROOT"
printf 'OPENCLAW_HOME: %s\n' "$OPENCLAW_HOME_SANDBOX"
printf 'CONTENT_OS_HOME: %s\n' "$CONTENT_OS_HOME_SANDBOX"
printf 'Gateway port: %s\n\n' "$GATEWAY_PORT_SANDBOX"

OPENCLAW_HOME="$OPENCLAW_HOME_SANDBOX" \
CONTENT_OS_HOME="$CONTENT_OS_HOME_SANDBOX" \
OPENCLAW_CONTENT_OS_SANDBOX=1 \
OPENCLAW_CONTENT_OS_GATEWAY_PORT="$GATEWAY_PORT_SANDBOX" \
bash "$SCRIPT_DIR/install.sh" "$@"

cat <<EOF

Sandbox install finished.

Next steps:
1. Enter sandbox in this terminal:
   source "$ENTER_SCRIPT"
2. Verify:
   bash "$OPENCLAW_HOME_SANDBOX/content-os-starter/scripts/check.sh"
3. Start isolated gateway in Terminal A:
   source "$ENTER_SCRIPT"
   openclaw gateway run --bind loopback --port "$GATEWAY_PORT_SANDBOX"
4. Open dashboard in Terminal B:
   source "$ENTER_SCRIPT"
   openclaw dashboard

Important:
- This sandbox does NOT write to your real ~/.openclaw
- This sandbox does NOT install a daemon
- This sandbox uses a separate gateway port
EOF
