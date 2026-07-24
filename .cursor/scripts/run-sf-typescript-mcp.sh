#!/usr/bin/env bash
# Launch Syncfusion TypeScript MCP with API key from path, env, or Keychain.
# Never echo the key.
set -euo pipefail

load_key_from_path() {
  local path="${1:-}"
  if [[ -n "$path" && -f "$path" ]]; then
    # trim trailing newline only
    local val
    val="$(tr -d '\r\n' <"$path")"
    if [[ -n "$val" ]]; then
      export Syncfusion_API_Key="$val"
      export SYNCFUSION_API_KEY="$val"
      return 0
    fi
  fi
  return 1
}

if [[ -z "${Syncfusion_API_Key:-}" && -z "${SYNCFUSION_API_KEY:-}" ]]; then
  load_key_from_path "${Syncfusion_API_Key_Path:-}" || true
fi

if [[ -z "${Syncfusion_API_Key:-}" && -z "${SYNCFUSION_API_KEY:-}" ]]; then
  for pair in \
    "com.wileyco.syncfusion.blazor-mcp:SYNCFUSION_API_KEY" \
    "SYNCFUSION_API_KEY:SYNCFUSION_API_KEY"; do
    s="${pair%%:*}"; a="${pair##*:}"
    val="$(security find-generic-password -s "$s" -a "$a" -w 2>/dev/null || true)"
    if [[ -n "$val" ]]; then
      export Syncfusion_API_Key="$val"
      export SYNCFUSION_API_KEY="$val"
      break
    fi
  done
fi

if [[ -z "${Syncfusion_API_Key:-}" && -n "${SYNCFUSION_API_KEY:-}" ]]; then
  export Syncfusion_API_Key="$SYNCFUSION_API_KEY"
fi
if [[ -z "${SYNCFUSION_API_KEY:-}" && -n "${Syncfusion_API_Key:-}" ]]; then
  export SYNCFUSION_API_KEY="$Syncfusion_API_Key"
fi

exec npx -y @syncfusion/typescript-assistant@latest
