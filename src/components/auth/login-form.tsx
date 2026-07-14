"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"
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

const fieldOrder = ["email", "password"] as const

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })

  async function onSubmit(values: LoginFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success(`${values.email}(으)로 로그인 되었습니다.`)
    form.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력해 계정에 로그인하세요.</CardDescription>
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
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "로그인 중..." : "로그인하기"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                회원가입
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
