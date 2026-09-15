#!/usr/bin/env bash
# Render resume.html to assets/stephen-mckitrick-resume.pdf (macOS Chrome or Chromium).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/stephen-mckitrick-resume.pdf"
HTML="file://${ROOT}/resume.html"
CHROME="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -x "$CHROME" ]]; then
  echo "Set CHROME_BIN to a Chromium binary that supports --print-to-pdf." >&2
  exit 1
fi

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --user-data-dir="${TMPDIR:-/tmp}/crc-resume-pdf" \
  --print-to-pdf="$OUT" \
  "$HTML" >/tmp/crc-resume-pdf.log 2>&1 &
chrome_pid=$!
for _ in $(seq 1 40); do
  if [[ -s "$OUT" ]]; then
    sleep 1
    kill "$chrome_pid" 2>/dev/null || true
    wait "$chrome_pid" 2>/dev/null || true
    echo "Wrote $OUT"
    exit 0
  fi
  sleep 0.5
done
kill "$chrome_pid" 2>/dev/null || true
echo "Timed out waiting for $OUT" >&2
exit 1
