import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "로그인",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
