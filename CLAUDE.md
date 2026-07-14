# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 커밋 메시지 규칙

커밋 메시지는 반드시 한국어로 작성한다. Conventional Commits 접두사(feat:, fix:, docs:, chore: 등) 사용 가능.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

새 shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add <component>
```

**E2E 테스트(Playwright)**: `@playwright/test`는 devDependency로 설치되어 있지만, 아직 `playwright.config.ts`와 테스트 파일이 없다. 새로 추가할 경우 설정 파일부터 작성한 뒤 `npx playwright test`(전체 실행) / `npx playwright test --ui`(UI 모드)로 실행한다.

**Claude Code hook 설정**: 개인 로컬 Bash 로깅·Slack 알림 hook은 `docs/claude-code-hooks.md`에 정리되어 있다. 저장소를 새로 clone했다면 이 문서를 참고해 `.claude/settings.local.json`을 직접 구성해야 한다.

## 아키텍처 개요

Next.js 16 App Router 기반 마케팅/콘텐츠형 스타터킷. 헤더 + 콘텐츠 + 푸터 레이아웃.

### 핵심 패턴

**클래스 병합**: 항상 `cn()` (`src/lib/utils.ts`) 사용
```ts
import { cn } from "@/lib/utils"
```

**shadcn 컴포넌트 패턴**: `cva` + `data-slot` + `asChild`/Radix `Slot` (기존 `button.tsx` 참조)

**공통 훅**: 직접 구현 전 `usehooks-ts` 우선 확인
```ts
import { useMediaQuery, useLocalStorage, useDebounceValue } from "usehooks-ts"
```

**폼**: `react-hook-form` + `zod` + `@hookform/resolvers`
```ts
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

**토스트**: `sonner`
```ts
import { toast } from "sonner"
toast.success("성공!")
```

**사이트 정보**: 네비 링크·이름·설명·URL은 `src/config/site.ts`에서만 수정

### 다크모드 — 쿠키 기반 SSR

`next-themes`를 사용하지 않고 커스텀 ThemeProvider(`src/components/providers/theme-provider.tsx`)를 직접 구현했다.

흐름:
1. `layout.tsx`(서버)가 `cookies()`로 `"theme"` 쿠키를 읽어 `initialTheme`으로 ThemeProvider에 전달
2. ThemeProvider(클라이언트)가 `initialTheme`으로 초기 상태를 세팅 → hydration 깜빡임 없음
3. 테마 변경 시 `localStorage`와 `document.cookie` 양쪽 동기화

다크모드 훅은 `useTheme()`을 ThemeProvider에서 직접 import:
```ts
import { useTheme } from "@/components/providers/theme-provider"
const { theme, setTheme, resolvedTheme } = useTheme()
```

### 스타일링

- Tailwind CSS v4 (`@import "tailwindcss"`) + `tw-animate-css` + `shadcn/tailwind.css`
- CSS 변수 기반 디자인 토큰 (`globals.css`의 `:root` / `.dark` 블록), oklch 색공간
- 다크모드: `.dark` 클래스 토글 방식 (`globals.css`의 `@custom-variant dark (&:is(.dark *))`)
- 폰트: `--font-geist-sans` → CSS 변수 `--font-sans`로 연결됨

### 주요 설정

- React Compiler 활성화 (`next.config.ts`) — 수동 `useMemo`/`useCallback` 불필요
- shadcn 설정: `components.json` (style: `radix-nova`, iconLibrary: `lucide`)
- `lang="ko"` 고정 (`layout.tsx`)
