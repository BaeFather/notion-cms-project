"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from "@/components/common/mode-toggle"
import { Container } from "@/components/layout/container"

function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={className}>
      {siteConfig.nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {siteConfig.name}
          </Link>

          {/* 데스크톱 네비 (md 이상) */}
          <NavLinks className="hidden md:flex items-center gap-6" />
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button asChild size="sm">
            <Link href="/login">로그인</Link>
          </Button>
        </div>

        {/* 모바일 네비 (md 미만) */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="메뉴 열기">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <NavLinks className="mt-6 flex flex-col gap-4" />
              <Button asChild className="mt-6">
                <Link href="/login">로그인</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
