"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { signupSchema, type SignupFormValues } from "@/lib/validations/auth"
import { focusFirstInvalidField } from "@/lib/forms/focus-first-invalid-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const fieldOrder = ["email", "password", "confirmPassword"] as const

export function SignupForm() {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  })

  async function onSubmit(values: SignupFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success(`${values.email}(으)로 회원가입이 완료되었습니다.`)
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력해 새 계정을 만드세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) =>
              focusFirstInvalidField(form, fieldOrder, errors)
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "가입 처리 중..." : "회원가입"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                로그인
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
