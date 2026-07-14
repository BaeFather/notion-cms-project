# 학습노트

Notion을 CMS로 활용해, Notion에서 글을 작성하면 별도 배포 작업 없이 웹사이트에 자동으로 반영되는 개인 학습 노트 서비스입니다. 자세한 기획 배경은 [`docs/PRD.md`](docs/PRD.md)를 참고하세요.

## 핵심 기능

- **글 목록 조회** — Notion 데이터베이스의 글을 최신순으로 카드 형태로 표시
- **글 상세 조회** — 선택한 글의 Notion 페이지 본문(블록)을 렌더링
- **태그 필터링** — Tags 속성 기준으로 목록 필터링
- **검색** — 제목/본문 기준 실시간 검색
- **반응형 레이아웃** — 모바일/태블릿/데스크톱에 맞춰 자동 재배치

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Notion API](https://developers.notion.com) (`@notionhq/client`) — CMS 데이터 소스
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- `react-hook-form` + `zod` (폼), `sonner` (토스트), `usehooks-ts` (공통 훅)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다 (`.env*`는 `.gitignore`에 포함되어 커밋되지 않습니다).

```bash
# .env.local
NOTION_API_KEY=ntn_xxx...            # Notion Internal Integration Token
NOTION_DATA_SOURCE_ID=xxxxxxxx-...   # 학습노트 데이터베이스의 data source ID
```

Notion 쪽 준비 사항:

1. [Notion 개발자 포털](https://www.notion.so/my-integrations)에서 Internal Integration을 만들고 토큰을 발급받습니다.
2. 학습노트로 쓸 Notion 데이터베이스를 만들고, 아래 속성을 갖추도록 구성합니다.

   | 속성명 | Notion 타입 | 설명 |
   | --- | --- | --- |
   | 이름 (Title) | title | 글 제목 |
   | Tags | multi_select | 카테고리 태그 |
   | CreatedAt | date | 작성일 |
   | Content | rich_text | 목록 카드에 노출할 짧은 요약 (선택) |

   본문은 별도 속성이 아니라 각 페이지의 본문 블록(paragraph, heading, list 등)으로 작성하며, 상세 페이지에서 그대로 렌더링됩니다.
3. 데이터베이스 우측 상단 **연결(Connections)** 메뉴에서 만든 Integration을 연결해야 API로 접근할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다. Notion에서 글을 쓰면 재배포 없이 (`revalidate = 60`) 홈/상세 페이지에 자동 반영됩니다.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

새 shadcn 컴포넌트 추가:

```bash
npx shadcn@latest add <component>
```

## 프로젝트 구조

```text
src/
├── app/
│   ├── page.tsx              # 홈 — 글 목록/검색/태그 필터
│   └── posts/[id]/page.tsx   # 글 상세
├── components/
│   └── notion/                # Notion 연동 UI (블록 렌더러, 카드, 검색·필터)
├── lib/
│   └── notion.ts               # @notionhq/client 연동 (목록/단건/블록 조회)
└── config/site.ts              # 사이트명·네비게이션 등 공통 설정
```

## 참고 문서

- [`docs/PRD.md`](docs/PRD.md) — 제품 요구사항 정의서
- [`docs/claude-code-hooks.md`](docs/claude-code-hooks.md) — 개인 로컬 Claude Code hook(Bash 로깅, Slack 알림) 설정 가이드
- [`CLAUDE.md`](CLAUDE.md) — 코드 컨벤션 및 아키텍처 개요 (Claude Code용)
