"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 변경">
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>라이트</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>다크</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>시스템</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
