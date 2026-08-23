import { zodResolver } from "@hookform/resolvers/zod"
import { FolderPlus } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  categoryRequestSchema,
  type Category,
  type CreateCategoryRequest,
} from "@/features/categories/schemas/category-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type CategoryDialogProps = {
  category?: Category
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateCategoryRequest) => Promise<void>
  open: boolean
}

export function CategoryDialog({
  category,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
}: CategoryDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateCategoryRequest>({
    defaultValues: {
      description: category?.description ?? "",
      name: category?.name ?? "",
      status: category?.status ?? "",
    },
    resolver: zodResolver(categoryRequestSchema),
  })
  const isBusy = isSaving || isSubmitting

  const submit = async (values: CreateCategoryRequest) => {
    try {
      await onSubmit({
        ...values,
        status: values.status?.trim() || null,
      })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
          </DialogTitle>
          <DialogDescription>
            Danh mục dùng để phân loại tài liệu trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="category-name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              autoFocus
              id="category-name"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="category-description">
              Mô tả <span className="text-destructive">*</span>
            </Label>
            <Textarea
              aria-invalid={Boolean(errors.description)}
              id="category-description"
              placeholder="Mô tả nội dung thuộc danh mục này..."
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="category-status">Ghi chú trạng thái</Label>
            <Input
              id="category-status"
              placeholder="Ví dụ: draft, published..."
              {...register("status")}
            />
            <p className="text-xs text-muted-foreground">
              Trường tự do, không ảnh hưởng đến việc danh mục có hoạt động hay
              không.
            </p>
          </div>

          {errors.root?.message ? (
            <p
              className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy} type="submit">
              <FolderPlus aria-hidden="true" />
              {isBusy
                ? "Đang lưu..."
                : category
                  ? "Lưu thay đổi"
                  : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
