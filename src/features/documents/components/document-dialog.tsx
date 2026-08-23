import { zodResolver } from "@hookform/resolvers/zod"
import { FileUp, UploadCloud } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleOptionCard } from "@/components/shared/form/toggle-option-card"
import { useAccessLevelsQuery } from "@/features/access-level/queries/use-queries"
import { useCategoriesQuery } from "@/features/categories/queries/use-queries"
import { useDepartmentsQuery } from "@/features/departments/queries/use-queries"
import { flattenDepartmentTreeWithDepth } from "@/features/departments/utils/tree"
import {
  documentFormSchema,
  type Document,
  type DocumentFormValues,
} from "@/features/documents/schemas/document-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type DocumentDialogProps = {
  document?: Document
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: DocumentFormValues) => Promise<void>
  open: boolean
}

export function DocumentDialog({
  document,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
}: DocumentDialogProps) {
  const categoriesQuery = useCategoriesQuery()
  const departmentsQuery = useDepartmentsQuery()
  const accessLevelsQuery = useAccessLevelsQuery()
  const flatDepartments = flattenDepartmentTreeWithDepth(
    departmentsQuery.data ?? []
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<DocumentFormValues>({
    defaultValues: {
      categoryId: document?.categoryId ?? null,
      departmentId: document?.departmentId ?? null,
      file: null,
      fileType: document?.fileType ?? "",
      isPublic: document?.isPublic ?? false,
      minAccessLevelId: document?.minAccessLevelId ?? null,
      sourceUrl: document?.sourceUrl ?? "",
      title: document?.title ?? "",
    },
    resolver: zodResolver(documentFormSchema),
  })
  const isBusy = isSaving || isSubmitting
  const selectedFile = watch("file")
  const categoryId = watch("categoryId")
  const departmentId = watch("departmentId")
  const minAccessLevelId = watch("minAccessLevelId")
  const isPublic = watch("isPublic")

  const submit = async (values: DocumentFormValues) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {document ? "Chỉnh sửa tài liệu" : "Thêm tài liệu"}
          </DialogTitle>
          <DialogDescription>
            Tải lên tệp hoặc nhập đường dẫn nguồn cho tài liệu.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="document-title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={Boolean(errors.title)}
              autoFocus
              id="document-title"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="document-file">Tệp tài liệu</Label>
            <label
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center hover:bg-muted/40"
              htmlFor="document-file"
            >
              <UploadCloud
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <span className="text-sm">
                {selectedFile ? selectedFile.name : "Chọn tệp để tải lên"}
              </span>
              <input
                accept="*/*"
                className="sr-only"
                id="document-file"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setValue("file", file, { shouldValidate: true })
                  if (file && !watch("fileType")) {
                    const extension = file.name.split(".").pop()
                    if (extension) setValue("fileType", extension.toUpperCase())
                  }
                }}
                type="file"
              />
            </label>

            <div className="space-y-2">
              <Label htmlFor="document-source-url">Hoặc đường dẫn nguồn</Label>
              <Input
                aria-invalid={Boolean(errors.sourceUrl)}
                id="document-source-url"
                placeholder="https://..."
                {...register("sourceUrl")}
              />
            </div>
            {errors.sourceUrl ? (
              <p className="text-xs text-destructive">
                {errors.sourceUrl.message}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="document-file-type">
                Loại tệp <span className="text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.fileType)}
                id="document-file-type"
                placeholder="PDF, DOCX..."
                {...register("fileType")}
              />
              {errors.fileType ? (
                <p className="text-xs text-destructive">
                  {errors.fileType.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="document-category">Danh mục</Label>
              <Select
                onValueChange={(value) =>
                  setValue("categoryId", value === "none" ? null : value)
                }
                value={categoryId ?? "none"}
              >
                <SelectTrigger className="w-full" id="document-category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {(categoriesQuery.data ?? [])
                    .filter((category) => category.isActive)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-department">Phòng ban</Label>
              <Select
                onValueChange={(value) =>
                  setValue("departmentId", value === "none" ? null : value)
                }
                value={departmentId ?? "none"}
              >
                <SelectTrigger className="w-full" id="document-department">
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {flatDepartments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {"— ".repeat(department.depth)}
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-access-level">
                Cấp độ truy cập tối thiểu
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("minAccessLevelId", value === "none" ? null : value)
                }
                value={minAccessLevelId ?? "none"}
              >
                <SelectTrigger className="w-full" id="document-access-level">
                  <SelectValue placeholder="Mặc định" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Mặc định</SelectItem>
                  {(accessLevelsQuery.data ?? [])
                    .filter((accessLevel) => accessLevel.isActive)
                    .map((accessLevel) => (
                      <SelectItem key={accessLevel.id} value={accessLevel.id}>
                        Cấp {accessLevel.level}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ToggleOptionCard
            checked={isPublic}
            description="Tài liệu công khai có thể truy cập mà không cần đăng nhập."
            label="Công khai tài liệu"
            onCheckedChange={(value) => setValue("isPublic", value)}
          />

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
              <FileUp aria-hidden="true" />
              {isBusy
                ? "Đang lưu..."
                : document
                  ? "Lưu thay đổi"
                  : "Tạo tài liệu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
