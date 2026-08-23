import { z } from "zod"

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
  version: z.number().int().nullish(),
})

export const documentPageSchema = z.object({
  data: z.array(documentSchema),
  limit: z.number().int(),
  page: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
})

export const documentFormSchema = z
  .object({
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
  .refine((values) => Boolean(values.file) || Boolean(values.sourceUrl), {
    message: "Cần tải tệp lên hoặc nhập đường dẫn nguồn.",
    path: ["sourceUrl"],
  })

export type Document = z.infer<typeof documentSchema>
export type DocumentPage = z.infer<typeof documentPageSchema>
export type DocumentFormValues = z.infer<typeof documentFormSchema>
export type DocStatus = z.infer<typeof docStatusSchema>
