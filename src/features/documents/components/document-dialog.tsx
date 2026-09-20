import { zodResolver } from "@hookform/resolvers/zod"
import {
  FileText,
  Folder,
  Globe,
  Loader2,
  Save,
  UploadCloud,
  X,
} from "lucide-react"
import { useForm } from "react-hook-form"

// TODO(url-source): re-enable when the "Dán đường dẫn URL" flow is
// implemented - see the commented-out Tabs block further down this file.
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { DocumentFilePreview } from "@/components/shared/document-file-preview"
import {
  ALLOWED_DOCUMENT_FILE_EXTENSIONS,
  documentEditFormSchema,
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
  open?: boolean
}

export function DocumentDialog({
  document,
  isSaving,
  onOpenChange,
  onSubmit,
}: DocumentDialogProps) {
  const categoriesQuery = useCategoriesQuery()
  const departmentsQuery = useDepartmentsQuery()
  const accessLevelsQuery = useAccessLevelsQuery()
  const flatDepartments = flattenDepartmentTreeWithDepth(
    departmentsQuery.data ?? []
  )

  const isEdit = Boolean(document)

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
    resolver: zodResolver(isEdit ? documentEditFormSchema : documentFormSchema),
  })

  const isBusy = isSaving || isSubmitting
  // TODO(url-source): re-enable when the "Dán đường dẫn URL" flow is
  // implemented - see the commented-out Tabs block further down this file.
  // const [sourceMode, setSourceMode] = useState<"upload" | "url">(
  //   document?.sourceUrl ? "url" : "upload"
  // )
  const selectedFile = watch("file")
  const categoryId = watch("categoryId")
  const departmentId = watch("departmentId")
  const minAccessLevelId = watch("minAccessLevelId")
  const isPublic = watch("isPublic")

  const handleCancel = () => {
    onOpenChange(false)
  }

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
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Quản trị · Nội dung
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            {isEdit
              ? `Chỉnh sửa tài liệu — ${document?.title}`
              : "Thêm tài liệu mới"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tải lên tệp hoặc nhập đường dẫn nguồn và cấu hình thông tin phân
            loại cho tài liệu.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <Button
            disabled={isBusy}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Hủy
          </Button>
          <Button disabled={isBusy} form="document-form" type="submit">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdit ? "Lưu thay đổi" : "Tạo tài liệu"}
              </>
            )}
          </Button>
        </div>
      </div>

      <form
        className="space-y-6"
        id="document-form"
        onSubmit={(event) => void handleSubmit(submit)(event)}
      >
        {/* Basic Info Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Thông tin cơ bản
              </CardTitle>
            </div>
            <CardDescription>
              Tên tiêu đề hiển thị chính của tài liệu trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="document-title">
                Tiêu đề tài liệu{" "}
                <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.title)}
                autoFocus
                id="document-title"
                placeholder="Nhập tiêu đề tài liệu..."
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Source & File Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <UploadCloud className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Nguồn tài liệu & Tệp tin
              </CardTitle>
            </div>
            <CardDescription>
              {isEdit
                ? "Xem trước tệp tài liệu hiện tại. Chọn tệp mới bên dưới để thay thế — tệp cũ sẽ được lưu lại trong lịch sử phiên bản."
                : "Tải lên tệp tài liệu trực tiếp từ máy tính."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEdit ? (
              <div className="space-y-3">
                {document?.fileUrl ? (
                  <DocumentFilePreview
                    fileType={document.fileType}
                    fileUrl={document.fileUrl}
                    title={document.title}
                  />
                ) : (
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {document?.sourceUrl
                      ? `Tài liệu này trỏ tới nguồn ngoài: ${document.sourceUrl}`
                      : "Tài liệu này chưa có tệp đính kèm."}
                  </div>
                )}

                {selectedFile ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border bg-muted/20 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ·
                          Sẽ thay thế tệp hiện tại
                        </p>
                      </div>
                    </div>
                    <Button
                      aria-label="Bỏ chọn tệp thay thế"
                      onClick={() =>
                        setValue("file", null, { shouldValidate: true })
                      }
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <label
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center text-sm font-medium text-primary transition-colors hover:border-primary/50 hover:bg-muted/30"
                    htmlFor="document-file-replace"
                  >
                    <UploadCloud aria-hidden="true" className="size-4" />
                    Thay thế tệp tài liệu
                    <input
                      accept={ALLOWED_DOCUMENT_FILE_EXTENSIONS.join(",")}
                      className="sr-only"
                      id="document-file-replace"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null
                        setValue("file", file, { shouldValidate: true })
                      }}
                      type="file"
                    />
                  </label>
                )}
                {errors.file ? (
                  <p className="text-xs text-destructive">
                    {errors.file.message}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {/* TODO(url-source): re-enable the "Dán đường dẫn URL" tab
                once that flow is implemented, by restoring this block in
                place of the plain dropzone below (and un-commenting the
                Tabs import + sourceMode state above):

                <Tabs
                  onValueChange={(value) => {
                    setSourceMode(value as "upload" | "url")
                    if (value === "upload") {
                      setValue("sourceUrl", "")
                    } else {
                      setValue("file", null, { shouldValidate: true })
                    }
                  }}
                  value={sourceMode}
                >
                  <TabsList className="w-full max-w-md">
                    <TabsTrigger className="flex-1" value="upload">
                      Tải tệp lên
                    </TabsTrigger>
                    <TabsTrigger className="flex-1" value="url">
                      Dán đường dẫn URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent className="mt-4" value="upload">
                    (... the dropzone JSX below, unchanged ...)
                  </TabsContent>

                  <TabsContent className="mt-4 space-y-4" value="url">
                    <div className="space-y-2">
                      <Label htmlFor="document-source-url">
                        Đường dẫn tài liệu (URL)
                      </Label>
                      <Input
                        aria-invalid={Boolean(errors.sourceUrl)}
                        id="document-source-url"
                        placeholder="https://example.com/document.pdf"
                        {...register("sourceUrl")}
                      />
                      {errors.sourceUrl ? (
                        <p className="text-xs text-destructive">
                          {errors.sourceUrl.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="max-w-xs space-y-2">
                      <Label htmlFor="document-file-type">
                        Loại tệp{" "}
                        <span className="translate-y-0.5 text-destructive">*</span>
                      </Label>
                      <Input
                        aria-invalid={Boolean(errors.fileType)}
                        id="document-file-type"
                        placeholder="PDF, DOCX, TXT..."
                        {...register("fileType")}
                      />
                      {errors.fileType ? (
                        <p className="text-xs text-destructive">
                          {errors.fileType.message}
                        </p>
                      ) : null}
                    </div>
                  </TabsContent>
                </Tabs>
                */}
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border bg-muted/20 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      aria-label="Bỏ chọn tệp"
                      onClick={() =>
                        setValue("file", null, { shouldValidate: true })
                      }
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <label
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
                    htmlFor="document-file"
                  >
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <UploadCloud aria-hidden="true" className="size-6" />
                    </div>
                    <div className="mt-1">
                      <span className="text-sm font-semibold text-foreground">
                        Nhấn để chọn tệp
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        hoặc kéo thả vào đây
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Định dạng hỗ trợ:{" "}
                      <span className="font-mono">
                        {ALLOWED_DOCUMENT_FILE_EXTENSIONS.join(", ")}
                      </span>
                    </span>
                    <input
                      accept={ALLOWED_DOCUMENT_FILE_EXTENSIONS.join(",")}
                      className="sr-only"
                      id="document-file"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null
                        setValue("file", file, { shouldValidate: true })
                        if (!file) return

                        const lastDot = file.name.lastIndexOf(".")
                        const nameWithoutExtension =
                          lastDot > 0 ? file.name.slice(0, lastDot) : file.name
                        const extension =
                          lastDot > 0 ? file.name.slice(lastDot + 1) : ""

                        if (extension) {
                          setValue("fileType", extension.toUpperCase())
                        }
                        if (!watch("title")) {
                          setValue("title", nameWithoutExtension)
                        }
                      }}
                      type="file"
                    />
                  </label>
                )}
                {errors.file ? (
                  <p className="mt-2 text-xs text-destructive">
                    {errors.file.message}
                  </p>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        {/* Classification & Access Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Folder className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Phân loại & Cấp độ truy cập
              </CardTitle>
            </div>
            <CardDescription>
              Thiết lập danh mục, phòng ban sở hữu và hạn chế cấp độ truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
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
                    <SelectItem value="none">Không chọn (Không có)</SelectItem>
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
                    <SelectItem value="none">Không chọn (Không có)</SelectItem>
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
                    setValue(
                      "minAccessLevelId",
                      value === "none" ? null : value
                    )
                  }
                  value={minAccessLevelId ?? "none"}
                >
                  <SelectTrigger className="w-full" id="document-access-level">
                    <SelectValue placeholder="Mặc định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Mặc định (Không yêu cầu)
                    </SelectItem>
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
          </CardContent>
        </Card>

        {/* Scope Card */}
        <Card className="border bg-card shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                Phạm vi chia sẻ
              </CardTitle>
            </div>
            <CardDescription>
              Cấu hình tính công khai của tài liệu trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleOptionCard
              checked={isPublic}
              description="Tài liệu công khai có thể được truy cập bởi tất cả người dùng mà không cần đăng nhập."
              label="Công khai tài liệu"
              onCheckedChange={(value) => setValue("isPublic", value)}
            />
          </CardContent>
        </Card>

        {errors.root?.message ? (
          <p
            className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive"
            role="alert"
          >
            {errors.root.message}
          </p>
        ) : null}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            disabled={isBusy}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Hủy
          </Button>
          <Button disabled={isBusy} type="submit">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdit ? "Lưu thay đổi" : "Tạo tài liệu"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
