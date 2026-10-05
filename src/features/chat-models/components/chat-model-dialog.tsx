import { zodResolver } from "@hookform/resolvers/zod"
import { Gauge, KeyRound, SlidersHorizontal } from "lucide-react"
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
  CHAT_MODEL_PROVIDERS,
  getChatModelProviderOption,
  getChatModelSuggestions,
} from "@/features/chat-models/constants/chat-model-providers"
import {
  buildChatModelFormSchema,
  type ChatModel,
  type ChatModelPurpose,
  chatModelPurposeSchema,
  type CreateChatModelRequest,
} from "@/features/chat-models/schemas/chat-model-schemas"
import {
  DEFAULT_MAX_RPM,
  getPurposeLabel,
  getSourceTypeLabel,
} from "@/features/chat-models/utils/chat-model-formatters"
import {
  applyFieldErrors,
  getErrorCode,
  getErrorMessage,
} from "@/utils/error-handler"

// Mirrors ErrorCode.java's Dynamic Model Registry block (25xx) - these two
// don't come back as a field-keyed `errors` map (unlike, say,
// CHAT_MODEL_API_KEY_REQUIRED), so they need mapping to a field by hand.
const CHAT_MODEL_API_KEY_REQUIRED_FOR_NEW_HOST_CODE = 2514
const CHAT_MODEL_URL_NOT_ALLOWED_CODE = 2516

type ChatModelDialogProps = {
  chatModel?: ChatModel
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateChatModelRequest) => Promise<void>
  open: boolean
}

// Blank number inputs mean "not set" (no limit / no priority), never 0.
function toOptionalNumber(value: string | number | null): number | null {
  if (value === "" || value === null) return null
  return Number(value)
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
      displayName: chatModel?.displayName ?? "",
      llmModelName: chatModel?.llmModelName ?? "",
      llmProvider: chatModel?.llmProvider ?? "",
      maxConcurrency: chatModel?.maxConcurrency ?? null,
      // A new credential starts at the free-tier Gemini limit; an existing one keeps its own
      // value, blank included (= no limit).
      maxRpm: chatModel ? (chatModel.maxRpm ?? null) : DEFAULT_MAX_RPM,
      modelPurpose: chatModel?.modelPurpose ?? "CHAT",
      modelSourceRef: chatModel?.modelSourceRef ?? "",
      priority: chatModel?.priority ?? null,
      sourceType: chatModel?.sourceType ?? "CLOUD_API",
    },
    resolver: zodResolver(buildChatModelFormSchema(Boolean(chatModel))),
  })
  const sourceType = watch("sourceType")
  const modelPurpose = watch("modelPurpose")
  const llmProvider = watch("llmProvider")
  const isBusy = isSaving || isSubmitting
  const modelNameSuggestions =
    sourceType === "CLOUD_API"
      ? getChatModelSuggestions(llmProvider, modelPurpose)
      : []

  const submit = async (values: CreateChatModelRequest) => {
    try {
      await onSubmit({
        ...values,
        // Blank apiKey on edit means "keep the existing key" - never send it
        // as an empty string, which the backend would treat as clearing it.
        apiKey: values.apiKey?.trim() ? values.apiKey.trim() : undefined,
        displayName: values.displayName?.trim() || undefined,
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
      const errorCode = getErrorCode(error)

      if (errorCode === CHAT_MODEL_API_KEY_REQUIRED_FOR_NEW_HOST_CODE) {
        setError("apiKey", { message: getErrorMessage(error), type: "server" })
      } else if (errorCode === CHAT_MODEL_URL_NOT_ALLOWED_CODE) {
        setError("apiBaseUrl", {
          message: getErrorMessage(error),
          type: "server",
        })
      } else if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {chatModel ? "Chỉnh sửa mô hình chat" : "Thêm mô hình chat mới"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình mô hình ngôn ngữ dùng cho tính năng trò chuyện với UniSage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-1"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          {/* Section 1: Source & Purpose */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4 dark:bg-muted/10">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <SlidersHorizontal
                aria-hidden="true"
                className="size-3.5 text-primary"
              />
              Cấu hình cơ bản
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chat-model-purpose">
                  Mục đích sử dụng{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <Select
                  disabled={Boolean(chatModel)}
                  onValueChange={(value) =>
                    setValue("modelPurpose", value as ChatModelPurpose, {
                      shouldDirty: true,
                    })
                  }
                  value={modelPurpose}
                >
                  <SelectTrigger
                    className="w-full bg-background"
                    id="chat-model-purpose"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chatModelPurposeSchema.options.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {getPurposeLabel(purpose)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {chatModel ? (
                  <p className="text-[11px] text-muted-foreground">
                    Mục đích sử dụng không thể thay đổi sau khi tạo.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
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
                  <SelectTrigger
                    className="w-full bg-background"
                    id="chat-model-source-type"
                  >
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
              </div>

              {sourceType === "CLOUD_API" ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="chat-model-provider">
                    Nhà cung cấp{" "}
                    <span className="translate-y-0.5 text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue("llmProvider", value, { shouldDirty: true })
                      const provider = getChatModelProviderOption(value)
                      if (provider) {
                        setValue("apiBaseUrl", provider.baseUrl, {
                          shouldDirty: true,
                        })
                      }
                    }}
                    value={watch("llmProvider") || undefined}
                  >
                    <SelectTrigger
                      aria-invalid={Boolean(errors.llmProvider)}
                      className="w-full bg-background"
                      id="chat-model-provider"
                    >
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {CHAT_MODEL_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <span className="flex items-center gap-2 whitespace-nowrap">
                            <img
                              alt=""
                              aria-hidden="true"
                              className="size-4 shrink-0 rounded-sm object-contain"
                              src={provider.logo}
                            />
                            {provider.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.llmProvider ? (
                    <p className="text-xs text-destructive">
                      {errors.llmProvider.message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="chat-model-source-ref">
                    Tham chiếu nguồn mô hình
                  </Label>
                  <Input
                    className="bg-background"
                    id="chat-model-source-ref"
                    placeholder="Ví dụ: đường dẫn hoặc tên container"
                    {...register("modelSourceRef")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Model & Connection details */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4 dark:bg-muted/10">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <KeyRound aria-hidden="true" className="size-3.5 text-primary" />
              Thông tin mô hình & Kết nối
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chat-model-name">
                  Tên mô hình{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <Input
                  aria-invalid={Boolean(errors.llmModelName)}
                  autoFocus
                  className="bg-background"
                  id="chat-model-name"
                  list="chat-model-name-suggestions"
                  placeholder="Ví dụ: gpt-4o-mini"
                  {...register("llmModelName")}
                />
                {modelNameSuggestions.length > 0 ? (
                  <datalist id="chat-model-name-suggestions">
                    {modelNameSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                ) : null}
                {errors.llmModelName ? (
                  <p className="text-xs text-destructive">
                    {errors.llmModelName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-model-display-name">
                  Tên gợi nhớ{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (tùy chọn)
                  </span>
                </Label>
                <Input
                  aria-invalid={Boolean(errors.displayName)}
                  className="bg-background"
                  id="chat-model-display-name"
                  placeholder="Ví dụ: Key backup #2, Tài khoản test..."
                  {...register("displayName")}
                />
                {errors.displayName ? (
                  <p className="text-xs text-destructive">
                    {errors.displayName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="chat-model-api-base-url">
                  API Base URL{" "}
                  <span className="translate-y-0.5 text-destructive">*</span>
                </Label>
                <Input
                  aria-invalid={Boolean(errors.apiBaseUrl)}
                  className="bg-background font-mono text-xs"
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="chat-model-api-key">
                  API key
                  {!chatModel && sourceType === "CLOUD_API" ? (
                    <span className="translate-y-0.5 text-destructive"> *</span>
                  ) : null}
                </Label>
                <Input
                  aria-invalid={Boolean(errors.apiKey)}
                  className="bg-background font-mono text-xs"
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
            </div>
          </div>

          {/* Section 3: Limits & Priority */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4 dark:bg-muted/10">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <Gauge aria-hidden="true" className="size-3.5 text-primary" />
              Giới hạn hệ thống & Độ ưu tiên
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="chat-model-max-rpm">Giới hạn RPM</Label>
                <Input
                  aria-invalid={Boolean(errors.maxRpm)}
                  className="bg-background"
                  id="chat-model-max-rpm"
                  min={1}
                  placeholder="Không giới hạn"
                  type="number"
                  {...register("maxRpm", { setValueAs: toOptionalNumber })}
                />
                {errors.maxRpm ? (
                  <p className="text-xs text-destructive">
                    {errors.maxRpm.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="chat-model-max-concurrency">
                  Giới hạn đồng thời
                </Label>
                <Input
                  aria-invalid={Boolean(errors.maxConcurrency)}
                  className="bg-background"
                  id="chat-model-max-concurrency"
                  min={1}
                  placeholder="Không giới hạn"
                  type="number"
                  {...register("maxConcurrency", {
                    setValueAs: toOptionalNumber,
                  })}
                />
                {errors.maxConcurrency ? (
                  <p className="text-xs text-destructive">
                    {errors.maxConcurrency.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="chat-model-priority">Độ ưu tiên</Label>
                <Input
                  className="bg-background"
                  id="chat-model-priority"
                  min={0}
                  placeholder="Chưa đặt"
                  type="number"
                  {...register("priority", { setValueAs: toOptionalNumber })}
                />
              </div>
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

          <DialogFooter className="pt-2">
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
