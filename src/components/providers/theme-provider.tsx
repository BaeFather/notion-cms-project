"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "theme"

function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: Theme
}

export function ThemeProvider({ children, initialTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme)

  const resolvedTheme = getResolvedTheme(theme)

  React.useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // 시스템 테마 변경 감지
  React.useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme(getResolvedTheme("system"))
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    // 서버 렌더링 시 테마를 읽을 수 있도록 쿠키에도 동기화
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`
    setThemeState(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
