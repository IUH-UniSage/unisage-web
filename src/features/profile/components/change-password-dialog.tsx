import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { profileApi } from "@/features/profile/api/profile-api"
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "@/features/profile/schemas/profile-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type ChangePasswordDialogProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
}

const FIELDS = [
  { label: "Mật khẩu hiện tại", name: "currentPassword" },
  { label: "Mật khẩu mới", name: "newPassword" },
  { label: "Nhập lại mật khẩu mới", name: "confirmPassword" },
] as const

export function ChangePasswordDialog({
  onOpenChange,
  open,
}: ChangePasswordDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    resolver: zodResolver(changePasswordFormSchema),
  })
  const changePassword = useMutation({
    meta: { successMessage: "Đã đổi mật khẩu.", suppressGlobalError: true },
    mutationFn: profileApi.changePassword,
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword })
      handleOpenChange(false)
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 8 ký tự).
            </DialogDescription>
          </DialogHeader>

          {FIELDS.map(({ label, name }) => (
            <div className="space-y-1.5" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                autoComplete={
                  name === "currentPassword"
                    ? "current-password"
                    : "new-password"
                }
                id={name}
                type="password"
                {...register(name)}
              />
              {errors[name] ? (
                <p className="text-xs text-destructive">
                  {errors[name]?.message}
                </p>
              ) : null}
            </div>
          ))}

          {errors.root ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <Loader2
                  aria-hidden="true"
                  className="mr-2 size-4 animate-spin"
                />
              ) : null}
              Đổi mật khẩu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
