#!/usr/bin/env bash

payload="$(cat)"
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"

command_str="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

printf '[%s] bash %s\n' "$timestamp" "$command_str" >> "$project_dir/hook_test.txt"

exit 0
