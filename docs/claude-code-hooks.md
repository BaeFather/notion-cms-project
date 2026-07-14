# Claude Code Hook 설정 가이드

이 프로젝트에서 Claude Code를 사용할 때 개인 작업 환경에 등록해 둔 hook들을 정리한 문서입니다. 모든 hook은 `.claude/settings.local.json`(git 미추적, 개인 로컬 설정)에 등록되어 있으므로 **저장소를 새로 clone한 사람은 이 문서를 참고해 직접 설정해야** 동일하게 동작합니다.

모든 hook 스크립트는 Bash(`.sh`)로 작성되어 있으며 `jq`(JSON 파싱/생성)와 `curl`(HTTP 요청)에 의존합니다. Git Bash(Windows)에는 기본 포함되지 않을 수 있으니 `jq --version`, `curl --version`으로 사전에 확인하세요.

## 개요

| Hook | 이벤트 | 대상 | 스크립트 | 목적 |
|---|---|---|---|---|
| Bash 명령 로깅 | `PreToolUse` (matcher: `Bash`) | Bash 도구 호출 전 | `.claude/hooks/log-bash-command.sh` | 실행되는 모든 Bash 명령을 프로젝트 루트 `hook_test.txt`에 기록 |
| 권한/대기 Slack 알림 | `Notification` (matcher 없음) | Claude Code가 알림을 보낼 때(권한 필요 시, 60초+ 입력 대기 시) | `.claude/hooks/slack-notify-notification.sh` | Claude가 권한을 요청하거나 입력을 오래 기다릴 때 Slack으로 알림 |
| 응답 완료 Slack 알림 | `Stop` (matcher 없음) | 매 턴(응답) 종료 시 | `.claude/hooks/slack-notify-stop.sh` | Claude 응답이 끝날 때마다 Slack으로 알림 |

## 1. Bash 명령 로깅

- **등록 위치**: `.claude/settings.local.json` → `hooks.PreToolUse`
- **동작 방식**: Claude Code가 Bash 도구를 실행하기 직전, `log-bash-command.sh`가 stdin으로 hook payload(JSON)를 받아 `jq -r '.tool_input.command // empty'`로 명령어를 추출한 뒤 아래 형식으로 `hook_test.txt`(프로젝트 루트)에 append합니다.

```text
[YYYY-MM-DD HH:MM:SS] bash <실행된 명령어>
```

- **차단 없음**: 로깅만 수행하고 항상 `exit 0`으로 종료하므로 실제 명령 실행을 막지 않습니다.
- `hook_test.txt`는 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 2. Slack 알림 (Notification / 응답 완료)

`Notification`과 `Stop`은 각각 **개별 스크립트**로 관리합니다 (`slack-notify-notification.sh`, `slack-notify-stop.sh`). 공통 로직(웹훅 URL 로드, JSON 생성, curl 전송)은 중복되지만, 이벤트별로 파일이 분리되어 있어 필요할 때 한쪽만 독립적으로 수정/비활성화하기 쉽습니다.

> **왜 `PermissionRequest`가 아니라 `Notification`인가?**
> Claude Code에는 도구별 권한 프롬프트 직전에 발화하는 저수준 `PermissionRequest` 훅(자동 allow/deny 등 프로그래매틱 제어용)과, Claude Code가 사용자에게 "알림"을 보내는 시점(① 권한이 필요할 때, ② 입력 없이 60초 이상 대기할 때)에 포괄적으로 발화하는 `Notification` 훅이 별도로 존재합니다. 이 프로젝트는 순수하게 "알림을 받고 싶다"는 목적이므로 `Notification` 이벤트를 사용합니다.

### 동작 방식

1. 프로젝트 루트의 `.env.local`이 있으면 `set -a; source .env.local; set +a`로 `SLACK_WEBHOOK_URL`을 로드
2. `SLACK_WEBHOOK_URL`이 없으면 아무 것도 하지 않고 조용히 종료 (에러로 Claude Code 흐름을 막지 않음)
3. stdin으로 받은 hook payload를 `jq`로 파싱해 이벤트별 정보 추출 후 Slack 메시지(mrkdwn) 구성
   - **Notification**: 프로젝트명, 알림 메시지(`message`, 있는 경우), 도구명·요약(`tool_name`/`tool_input`, 있는 경우 — `Bash`→명령어, `Write`/`Edit`/`NotebookEdit`→파일 경로, 그 외→`tool_input` JSON을 200자로 자름), 시각
   - **응답 완료(Stop)**: 프로젝트명, 세션 ID 앞 8자리, 시각
4. `jq -nc --arg text "$text" '{text:$text}'`로 JSON을 안전하게 이스케이프
5. `curl -s -m 8 -X POST -H "Content-Type: application/json" --data-binary @- <webhook_url>`로 Slack Incoming Webhook에 POST (8초 타임아웃, 실패해도 무시)
6. `async: true`로 등록되어 있어 Claude Code의 알림 표시나 응답 종료를 지연시키지 않음

### Windows 관련 주의사항

한글 등 멀티바이트 문자가 포함된 JSON을 **`curl -d "$json"`처럼 명령줄 인자로 전달하면**, Git Bash(MSYS)에서 네이티브 Windows용 `curl.exe`로 인자가 전달되는 과정(argv 변환 계층)에서 바이트가 깨질 수 있습니다. 이를 피하기 위해 반드시 `printf '%s' "$json" | curl ... --data-binary @-` 형태로 **stdin 파이프**를 통해 전달합니다. 명령줄 인자 대신 파이프(byte stream)를 쓰면 이 변환 계층을 우회할 수 있습니다.

### 필요한 환경변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채워야 합니다 (`.env*`는 `.gitignore`에 포함되어 커밋되지 않음).

```bash
# .env.local
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXXXXX/XXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

Slack Incoming Webhook URL은 [Slack App 관리 페이지](https://api.slack.com/apps)에서 해당 워크스페이스 앱의 **Incoming Webhooks** 기능을 활성화하면 채널별로 발급받을 수 있습니다.

## 새 개발 환경에서 동일하게 설정하는 방법

1. `jq`, `curl`이 설치되어 있는지 확인 (`jq --version`, `curl --version`)
2. `.env.local`에 `SLACK_WEBHOOK_URL` 추가 (위 참고)
3. `.claude/settings.local.json`에 아래 `hooks` 블록 추가 (기존 `permissions` 등 다른 필드는 유지)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/log-bash-command.sh\"" }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/slack-notify-notification.sh\"",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/slack-notify-stop.sh\"",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

4. 설정 반영이 안 될 경우 `/hooks` 명령으로 재확인하거나 Claude Code 세션을 재시작

## 관련 파일

- `.claude/hooks/log-bash-command.sh` — Bash 명령 로깅 스크립트
- `.claude/hooks/slack-notify-notification.sh` — `Notification` 이벤트 Slack 알림 스크립트
- `.claude/hooks/slack-notify-stop.sh` — `Stop` 이벤트 Slack 알림 스크립트
- `.claude/settings.local.json` — hook 등록 (개인 로컬, git 미추적)
- `.env.local` — `SLACK_WEBHOOK_URL` 등 시크릿 (git 미추적)
