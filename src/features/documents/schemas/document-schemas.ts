import { z } from "zod"

// Mirrors com.unisage.backend.entity.enums.AllowedFileType — keep in sync with
// the backend whitelist (enforced in FileServiceImpl.upload()) when it changes.
export const ALLOWED_DOCUMENT_FILE_EXTENSIONS = [
  ".txt",
  ".pdf",
  ".docx",
  ".doc",
  ".html",
]

function hasAllowedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ALLOWED_DOCUMENT_FILE_EXTENSIONS.some((extension) =>
    lower.endsWith(extension)
  )
}

export const docStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "OUTDATED",
])

export const documentSchema = z.object({
  categoryId: z.uuid().nullish(),
  categoryName: z.string().nullish(),
  createdAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdByName: z.string().nullish(),
  deletedAt: z.string().nullish(),
  departmentId: z.uuid().nullish(),
  departmentName: z.string().nullish(),
  fileType: z.string().nullish(),
  fileUrl: z.string().nullish(),
  id: z.uuid(),
  ingestedByUserId: z.uuid().nullish(),
  isActive: z.boolean().nullish(),
  isPublic: z.boolean().nullish(),
  minAccessLevel: z.number().int().nullish(),
  minAccessLevelId: z.uuid().nullish(),
  sourceUrl: z.string().nullish(),
  status: docStatusSchema,
  title: z.string(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedByName: z.string().nullish(),
  version: z.number().int().nullish(),
})

export const documentPageSchema = z.object({
  data: z.array(documentSchema),
  limit: z.number().int(),
  page: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
})

const documentFormBaseSchema = z.object({
  categoryId: z.uuid().nullish(),
  departmentId: z.uuid().nullish(),
  file: z.instanceof(File).nullish(),
  fileType: z
    .string()
    .trim()
    .min(1, "Loại tệp không được để trống.")
    .max(50, "Loại tệp không được vượt quá 50 ký tự."),
  isPublic: z.boolean(),
  minAccessLevelId: z.uuid().nullish(),
  sourceUrl: z
    .string()
    .trim()
    .max(2048, "Đường dẫn không được vượt quá 2048 ký tự.")
    .nullish(),
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề không được để trống.")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự."),
})

function checkFileExtension(
  values: z.infer<typeof documentFormBaseSchema>,
  ctx: z.RefinementCtx
) {
  if (values.file && !hasAllowedExtension(values.file.name)) {
    ctx.addIssue({
      code: "custom",
      message: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_DOCUMENT_FILE_EXTENSIONS.join(", ")}.`,
      path: ["file"],
    })
  }
}

// Creating a document requires a file or a source URL.
export const documentFormSchema = documentFormBaseSchema.superRefine(
  (values, ctx) => {
    if (!values.file && !values.sourceUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Cần tải tệp lên hoặc nhập đường dẫn nguồn.",
        path: ["sourceUrl"],
      })
    }

    checkFileExtension(values, ctx)
  }
)

// Editing a document currently only changes its metadata (see
// DocumentDialog's isEdit branch, which shows a file preview instead of an
// upload control) - unlike create, an existing file/source doesn't need to
// be re-supplied on every save.
export const documentEditFormSchema =
  documentFormBaseSchema.superRefine(checkFileExtension)

export type Document = z.infer<typeof documentSchema>
export type DocumentPage = z.infer<typeof documentPageSchema>
export type DocumentFormValues = z.infer<typeof documentFormSchema>
export type DocStatus = z.infer<typeof docStatusSchema>
