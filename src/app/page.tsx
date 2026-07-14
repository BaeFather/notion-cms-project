import Link from "next/link"
import { Anchor, Bell, Blocks, ClipboardCheck, Layers, MonitorSmartphone, MoonStar, Palette, Shield, ShieldCheck, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/layout/container"

const coreStack = [
  {
    icon: Zap,
    name: "Next.js 16",
    desc: "App Router 기반 풀스택 프레임워크",
  },
  {
    icon: Shield,
    name: "TypeScript",
    desc: "엄격한 타입으로 안전한 코드 작성",
  },
  {
    icon: Palette,
    name: "Tailwind CSS v4",
    desc: "CSS 변수 기반 유틸리티 스타일링",
  },
  {
    icon: Layers,
    name: "shadcn/ui",
    desc: "접근성 높은 UI 컴포넌트 라이브러리",
  },
]

const features = [
  {
    icon: Blocks,
    title: "shadcn/ui",
    description: "코드를 직접 소유하는 컴포넌트라 원하는 대로 뜯어고치고, 접근성은 기본으로 챙깁니다.",
  },
  {
    icon: MoonStar,
    title: "다크모드",
    description: "쿠키 기반 SSR 처리로 새로고침해도 화면 깜빡임 없이 테마가 그대로 유지됩니다.",
  },
  {
    icon: ClipboardCheck,
    title: "폼 유효성 검증",
    description: "react-hook-form과 zod가 맞물려, 검증 규칙 하나로 입력값과 타입을 동시에 지킵니다.",
  },
  {
    icon: Palette,
    title: "Tailwind CSS v4",
    description: "CSS 변수 토큰으로 색·간격을 한 곳에서 관리해 디자인이 흐트러지지 않습니다.",
  },
  {
    icon: ShieldCheck,
    title: "TypeScript",
    description: "자동완성과 타입 검사로 리팩터링이 두렵지 않고, 런타임 전에 버그를 잡습니다.",
  },
  {
    icon: Zap,
    title: "React Compiler",
    description: "수동 useMemo·useCallback 없이 컴파일러가 메모이제이션해 불필요한 렌더링을 줄입니다.",
  },
  {
    icon: Anchor,
    title: "usehooks-ts",
    description: "useLocalStorage·useDebounceValue 등 검증된 훅을 바로 써서 보일러플레이트를 줄입니다.",
  },
  {
    icon: Bell,
    title: "토스트 알림",
    description: "Sonner로 한 줄 호출만에 성공·에러 피드백을 사용자에게 즉시 띄웁니다.",
  },
  {
    icon: MonitorSmartphone,
    title: "반응형 레이아웃",
    description: "헤더·콘텐츠·푸터가 모바일과 데스크톱에서 모두 자연스럽게 동작합니다.",
  },
]

export default function Home() {
  return (
    <div className="py-16">
      <Container className="space-y-16">
        {/* 섹션 1 — 히어로 */}
        <section className="space-y-8 text-center">
          <Badge variant="secondary">Next.js 스타터킷</Badge>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            모던 웹 개발의 시작점
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            검증된 기술 스택으로 즉시 프로덕션에 투입할 수 있는 Next.js 스타터킷입니다.
            <br />
            반복적인 초기 설정 없이 핵심 기능 개발에 집중하세요.
          </p>

          {/* 핵심 기술 4종 */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {coreStack.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="flex flex-col items-center gap-2 py-4 text-center">
                <Icon className="size-7 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* 섹션 2 — 포함된 기능 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">주요 기능</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="size-6 text-muted-foreground" />
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* 섹션 3 — 시작하기 */}
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">지금 바로 시작하세요</h2>
            <p className="text-muted-foreground">
              예제로 컴포넌트를 확인하고, 문서에서 사용 방법을 알아보세요.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/examples">예제 보기</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">문서 보기</Link>
            </Button>
          </div>
        </section>
      </Container>
    </div>
  )
}
