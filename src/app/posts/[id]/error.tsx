"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-32">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="text-6xl font-bold text-muted-foreground">오류</p>
        <h1 className="text-2xl font-semibold">글을 불러오지 못했습니다</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <div className="flex gap-3">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}
