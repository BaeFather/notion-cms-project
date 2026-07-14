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

session_id="$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null | cut -c1-8 || true)"
project_name="$(basename "$project_dir")"
timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

lines=("✅ *Claude Code 응답 완료*" "• 프로젝트: \`${project_name}\`")
[ -n "$session_id" ] && lines+=("• 세션: \`${session_id}\`")
lines+=("• 시각: ${timestamp}")

text="$(printf '%s\n' "${lines[@]}")"
text="${text%$'\n'}"

json_payload="$(jq -nc --arg text "$text" '{text: $text}')"

# Windows에서 curl.exe(네이티브 바이너리)로 한글 등 멀티바이트 문자를 명령줄 인자로
# 넘기면 MSYS→Windows argv 변환 과정에서 깨질 수 있어, stdin 파이프로 전달한다.
printf '%s' "$json_payload" | curl -s -m 8 -X POST -H "Content-Type: application/json" --data-binary @- "$webhook_url" >/dev/null 2>&1 || true

exit 0
