import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  type ChatModel,
  type CreateChatModelRequest,
  createChatModelRequestSchema,
  updateChatModelRequestSchema,
} from "@/features/chat-models/schemas/chat-model-schemas"
import { getSourceTypeLabel } from "@/features/chat-models/utils/chat-model-formatters"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type ChatModelDialogProps = {
  chatModel?: ChatModel
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateChatModelRequest) => Promise<void>
  open: boolean
}

export function ChatModelDialog({
  chatModel,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
}: ChatModelDialogProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CreateChatModelRequest>({
    defaultValues: {
      apiBaseUrl: chatModel?.apiBaseUrl ?? "",
      apiKey: "",
      llmModelName: chatModel?.llmModelName ?? "",
      llmProvider: chatModel?.llmProvider ?? "",
      maxRpm: chatModel?.maxRpm ?? 60,
      modelSourceRef: chatModel?.modelSourceRef ?? "",
      priority: chatModel?.priority ?? null,
      sourceType: chatModel?.sourceType ?? "CLOUD_API",
    },
    resolver: zodResolver(
      chatModel ? updateChatModelRequestSchema : createChatModelRequestSchema
    ),
  })
  const sourceType = watch("sourceType")
  const isBusy = isSaving || isSubmitting

  const submit = async (values: CreateChatModelRequest) => {
    try {
      await onSubmit({
        ...values,
        // Blank apiKey on edit means "keep the existing key" - never send it
        // as an empty string, which the backend would treat as clearing it.
        apiKey: values.apiKey?.trim() ? values.apiKey.trim() : undefined,
        llmModelName: values.llmModelName.trim(),
        llmProvider:
          values.sourceType === "CLOUD_API"
            ? values.llmProvider?.trim()
            : undefined,
        modelSourceRef:
          values.sourceType === "SELF_HOSTED"
            ? values.modelSourceRef?.trim()
            : undefined,
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
            {chatModel ? "Chỉnh sửa mô hình chat" : "Thêm mô hình chat mới"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình mô hình ngôn ngữ dùng cho tính năng trò chuyện với UniSage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-3 rounded-xl border p-3">
            <Label htmlFor="chat-model-source-type">
              Nguồn mô hình{" "}
              <span className="translate-y-0.5 text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "sourceType",
                  value as CreateChatModelRequest["sourceType"],
                  { shouldDirty: true }
                )
              }
              value={sourceType}
            >
              <SelectTrigger className="w-full" id="chat-model-source-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLOUD_API">
                  {getSourceTypeLabel("CLOUD_API")}
                </SelectItem>
                <SelectItem value="SELF_HOSTED">
                  {getSourceTypeLabel("SELF_HOSTED")}
                </SelectItem>
              </SelectContent>
            </Select>

            {sourceType === "CLOUD_API" ? (
              <>
                <Label htmlFor="chat-model-provider">
                  Nhà cung cấp{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <Input
                  aria-invalid={Boolean(errors.llmProvider)}
                  id="chat-model-provider"
                  placeholder="Ví dụ: openai, google, anthropic"
                  {...register("llmProvider")}
                />
                {errors.llmProvider ? (
                  <p className="text-xs text-destructive">
                    {errors.llmProvider.message}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <Label htmlFor="chat-model-source-ref">
                  Tham chiếu nguồn mô hình
                </Label>
                <Input
                  id="chat-model-source-ref"
                  placeholder="Ví dụ: đường dẫn hoặc tên container"
                  {...register("modelSourceRef")}
                />
              </>
            )}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="chat-model-name">
              Tên mô hình{" "}
              <span className="translate-y-0.5 text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={Boolean(errors.llmModelName)}
              autoFocus
              id="chat-model-name"
              placeholder="Ví dụ: gpt-4o-mini"
              {...register("llmModelName")}
            />
            {errors.llmModelName ? (
              <p className="text-xs text-destructive">
                {errors.llmModelName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="chat-model-api-base-url">
              API Base URL{" "}
              <span className="translate-y-0.5 text-destructive">*</span>
            </Label>
            <Input
              aria-invalid={Boolean(errors.apiBaseUrl)}
              id="chat-model-api-base-url"
              placeholder="https://api.openai.com/v1"
              {...register("apiBaseUrl")}
            />
            {errors.apiBaseUrl ? (
              <p className="text-xs text-destructive">
                {errors.apiBaseUrl.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="chat-model-api-key">
              API key
              {!chatModel && sourceType === "CLOUD_API" ? (
                <span className="translate-y-0.5 text-destructive"> *</span>
              ) : null}
            </Label>
            <Input
              aria-invalid={Boolean(errors.apiKey)}
              id="chat-model-api-key"
              placeholder={
                chatModel
                  ? chatModel.hasApiKey
                    ? "Để trống để giữ nguyên API key hiện tại"
                    : "Chưa có API key"
                  : "Nhập API key"
              }
              type="password"
              {...register("apiKey")}
            />
            {errors.apiKey ? (
              <p className="text-xs text-destructive">
                {errors.apiKey.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border p-3">
            <div className="space-y-2">
              <Label htmlFor="chat-model-max-rpm">
                Giới hạn RPM{" "}
                <span className="translate-y-0.5 text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.maxRpm)}
                id="chat-model-max-rpm"
                min={1}
                type="number"
                {...register("maxRpm", { valueAsNumber: true })}
              />
              {errors.maxRpm ? (
                <p className="text-xs text-destructive">
                  {errors.maxRpm.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-model-priority">Độ ưu tiên</Label>
              <Input
                id="chat-model-priority"
                min={0}
                type="number"
                {...register("priority", {
                  setValueAs: (value: string) =>
                    value === "" ? null : Number(value),
                })}
              />
            </div>
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
              {isBusy
                ? "Đang lưu..."
                : chatModel
                  ? "Lưu thay đổi"
                  : "Tạo mô hình chat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
