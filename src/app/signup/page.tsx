import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "회원가입",
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
