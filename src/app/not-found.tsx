import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

export default function NotFound() {
  return (
    <div className="py-32">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Button asChild>
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </Container>
    </div>
  )
}
