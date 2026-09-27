import { z } from "zod"

// Fallback only - the real whitelist is the admin setting
// `ingest.allowed_file_extensions` (see useAllowedFileExtensions), which the
// backend enforces in FileServiceImpl. Mirrors its AllowedFileType default.
export const DEFAULT_ALLOWED_DOCUMENT_FILE_EXTENSIONS = [
  ".txt",
  ".pdf",
  ".docx",
  ".html",
]

function hasAllowedExtension(
  filename: string,
  allowedExtensions: readonly string[]
): boolean {
  const lower = filename.toLowerCase()
  return allowedExtensions.some((extension) => lower.endsWith(extension))
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
  ctx: z.RefinementCtx,
  allowedExtensions: readonly string[]
) {
  if (
    values.file &&
    !hasAllowedExtension(values.file.name, allowedExtensions)
  ) {
    ctx.addIssue({
      code: "custom",
      message: `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedExtensions.join(", ")}.`,
      path: ["file"],
    })
  }
}

// A public document has no access-level gate - mirrors the backend/DB constraint.
function checkPublicAccessLevel(
  values: z.infer<typeof documentFormBaseSchema>,
  ctx: z.RefinementCtx
) {
  if (values.isPublic && values.minAccessLevelId) {
    ctx.addIssue({
      code: "custom",
      message: "Tài liệu công khai không được đặt cấp độ truy cập tối thiểu.",
      path: ["minAccessLevelId"],
    })
  }
}

// Creating a document requires a file or a source URL.
export function createDocumentFormSchema(
  allowedExtensions: readonly string[] = DEFAULT_ALLOWED_DOCUMENT_FILE_EXTENSIONS
) {
  return documentFormBaseSchema.superRefine((values, ctx) => {
    if (!values.file && !values.sourceUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Cần tải tệp lên hoặc nhập đường dẫn nguồn.",
        path: ["sourceUrl"],
      })
    }

    checkFileExtension(values, ctx, allowedExtensions)
    checkPublicAccessLevel(values, ctx)
  })
}

export const documentFormSchema = createDocumentFormSchema()

// Editing a document doesn't require a file/source - the existing one stays
// in place unless the user picks a replacement via DocumentDialog's isEdit
// branch, which archives the current file into version history on save.
export function createDocumentEditFormSchema(
  allowedExtensions: readonly string[] = DEFAULT_ALLOWED_DOCUMENT_FILE_EXTENSIONS
) {
  return documentFormBaseSchema.superRefine((values, ctx) => {
    checkFileExtension(values, ctx, allowedExtensions)
    checkPublicAccessLevel(values, ctx)
  })
}

export type Document = z.infer<typeof documentSchema>
export type DocumentPage = z.infer<typeof documentPageSchema>
export type DocumentFormValues = z.infer<typeof documentFormSchema>
export type DocStatus = z.infer<typeof docStatusSchema>
