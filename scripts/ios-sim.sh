#!/usr/bin/env bash
#
# ios-sim.sh — Launch the app in Expo Go on the iOS Simulator.
#
# Why this exists: Expo's `i` shortcut (and `expo run:ios`) call AppleScript to
# check whether the Simulator app is running. In Electron-based terminals such
# as Wave, macOS blocks that Apple event (error -1743, "Not authorized to send
# Apple events to System Events"), which crashes the CLI. This script avoids the
# AppleScript path entirely by opening the app through `xcrun simctl openurl`.
#
# Usage: npm run ios   (or: ./scripts/ios-sim.sh)
#
set -uo pipefail

PORT="${PORT:-8081}"
SCHEME="exp://127.0.0.1:${PORT}"

# Print the UDID of a currently booted simulator, if any.
booted_udid() {
  xcrun simctl list devices booted | grep -Eo "[0-9A-Fa-f-]{36}" | head -1
}

echo "▸ Booting iOS Simulator…"
open -a Simulator || true

# Wait for a device to boot; if none appears, boot the first available iPhone.
for _ in $(seq 1 20); do
  [ -n "$(booted_udid)" ] && break
  sleep 0.5
done
if [ -z "$(booted_udid)" ]; then
  FALLBACK=$(xcrun simctl list devices available | grep -E "iPhone" | grep -Eo "[0-9A-Fa-f-]{36}" | head -1)
  if [ -n "${FALLBACK}" ]; then
    echo "▸ No booted device found; booting ${FALLBACK}…"
    xcrun simctl boot "${FALLBACK}" || true
    open -a Simulator || true
  fi
fi

# Once Metro reports ready, open the app in Expo Go. This runs in the background
# so Metro itself can stay in the foreground with its full interactive UI.
(
  for _ in $(seq 1 120); do
    if curl -s --max-time 1 "http://127.0.0.1:${PORT}/status" 2>/dev/null | grep -q "packager-status:running"; then
      sleep 1
      if xcrun simctl openurl booted "${SCHEME}" >/dev/null 2>&1; then
        printf '\n📱 Opened %s in the iOS Simulator (Expo Go).\n\n' "${SCHEME}"
      else
        printf '\n⚠️  Could not open automatically. Run: xcrun simctl openurl booted "%s"\n\n' "${SCHEME}" >&2
      fi
      exit 0
    fi
    sleep 0.5
  done
  printf '\n⚠️  Metro was not ready on port %s in time. Open manually: xcrun simctl openurl booted "%s"\n\n' "${PORT}" "${SCHEME}" >&2
) &

echo "▸ Starting Metro (hot reload enabled). Do NOT press 'i' — the app opens automatically."
exec npx expo start --port "${PORT}"
