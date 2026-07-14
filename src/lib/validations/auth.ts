import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일 주소를 입력해주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type SignupFormValues = z.infer<typeof signupSchema>
