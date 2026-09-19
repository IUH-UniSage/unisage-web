import { z } from "zod"

export const changePasswordFormSchema = z
  .object({
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .max(100, "Mật khẩu mới không được vượt quá 100 ký tự."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp.",
    path: ["confirmPassword"],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>
