#!/usr/bin/env bash

payload="$(cat)"
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [ -f "$project_dir/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$project_dir/.env.local"
  set +a
fi

webhook_url="${SLACK_WEBHOOK_URL:-}"
[ -z "$webhook_url" ] && exit 0

message="$(printf '%s' "$payload" | jq -r '.message // empty' 2>/dev/null || true)"
tool_name="$(printf '%s' "$payload" | jq -r '.tool_name // empty' 2>/dev/null || true)"

detail=""
if [ -n "$tool_name" ]; then
  case "$tool_name" in
    Bash)
      detail="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
      ;;
    Write|Edit|NotebookEdit)
      detail="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"
      ;;
    *)
      detail="$(printf '%s' "$payload" | jq -c '.tool_input // empty' 2>/dev/null | cut -c1-200 || true)"
      ;;
  esac
fi

project_name="$(basename "$project_dir")"
timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

lines=("🔔 *Claude Code 알림*" "• 프로젝트: \`${project_name}\`")
[ -n "$message" ] && lines+=("• 내용: ${message}")
[ -n "$tool_name" ] && lines+=("• 도구: \`${tool_name}\`")
[ -n "$detail" ] && lines+=("• 세부: \`${detail}\`")
lines+=("• 시각: ${timestamp}")

text="$(printf '%s\n' "${lines[@]}")"
text="${text%$'\n'}"

json_payload="$(jq -nc --arg text "$text" '{text: $text}')"

# Windows에서 curl.exe(네이티브 바이너리)로 한글 등 멀티바이트 문자를 명령줄 인자로
# 넘기면 MSYS→Windows argv 변환 과정에서 깨질 수 있어, stdin 파이프로 전달한다.
printf '%s' "$json_payload" | curl -s -m 8 -X POST -H "Content-Type: application/json" --data-binary @- "$webhook_url" >/dev/null 2>&1 || true

exit 0
