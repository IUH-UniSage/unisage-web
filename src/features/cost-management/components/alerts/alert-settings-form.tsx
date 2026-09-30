import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  updateBudgetAlertSettingRequestSchema,
  type BudgetAlertSetting,
  type UpdateBudgetAlertSettingFormValues,
} from "@/features/cost-management/schemas/cost-management-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

type AlertSettingsFormProps = {
  isSaving: boolean
  onSubmit: (input: UpdateBudgetAlertSettingFormValues) => Promise<void>
  setting: BudgetAlertSetting
}

function NumberChipList({
  onChange,
  suffix,
  values,
}: {
  onChange: (values: number[]) => void
  suffix: string
  values: number[]
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const parsed = Number(draft)
    if (!draft.trim() || Number.isNaN(parsed) || values.includes(parsed)) {
      setDraft("")
      return
    }
    onChange([...values, parsed].sort((a, b) => a - b))
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge className="gap-1.5 pr-1.5" key={value} variant="secondary">
            {value}
            {suffix}
            <button
              aria-label={`Xóa ngưỡng ${value}${suffix}`}
              className="rounded-full p-0.5 hover:bg-foreground/10"
              onClick={() => onChange(values.filter((v) => v !== value))}
              type="button"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="w-32"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Thêm ngưỡng"
          type="number"
          value={draft}
        />
        <Button onClick={add} size="sm" type="button" variant="outline">
          <Plus aria-hidden="true" />
          Thêm
        </Button>
      </div>
    </div>
  )
}

function EmailChipList({
  onChange,
  values,
}: {
  onChange: (values: string[]) => void
  values: string[]
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed || values.includes(trimmed)) {
      setDraft("")
      return
    }
    onChange([...values, trimmed])
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge className="gap-1.5 pr-1.5" key={value} variant="secondary">
            {value}
            <button
              aria-label={`Xóa email ${value}`}
              className="rounded-full p-0.5 hover:bg-foreground/10"
              onClick={() => onChange(values.filter((v) => v !== value))}
              type="button"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="max-w-64"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Thêm địa chỉ email"
          type="email"
          value={draft}
        />
        <Button onClick={add} size="sm" type="button" variant="outline">
          <Plus aria-hidden="true" />
          Thêm
        </Button>
      </div>
    </div>
  )
}

export function AlertSettingsForm({
  isSaving,
  onSubmit,
  setting,
}: AlertSettingsFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
    setValue,
    watch,
  } = useForm<UpdateBudgetAlertSettingFormValues>({
    defaultValues: {
      emailEnabled: setting.emailEnabled,
      emailRecipients: setting.emailRecipients,
      inAppEnabled: setting.inAppEnabled,
      slackEnabled: setting.slackEnabled,
      spikeDetectionEnabled: setting.spikeDetectionEnabled,
      spikeThresholdPercent: setting.spikeThresholdPercent,
      thresholdsPercent: setting.thresholdsPercent,
    },
    resolver: zodResolver(updateBudgetAlertSettingRequestSchema),
  })
  const isBusy = isSaving || isSubmitting

  const submit = async (values: UpdateBudgetAlertSettingFormValues) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Card className="border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Cấu hình cảnh báo</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-2 rounded-xl border p-3">
            <Label>Ngưỡng cảnh báo (%)</Label>
            <p className="text-xs text-muted-foreground">
              Mặc định 50/80/100% - có thể thêm ngưỡng tùy chỉnh.
            </p>
            <NumberChipList
              onChange={(values) =>
                setValue("thresholdsPercent", values, { shouldDirty: true })
              }
              suffix="%"
              values={watch("thresholdsPercent")}
            />
            {errors.thresholdsPercent ? (
              <p className="text-xs text-destructive">
                {errors.thresholdsPercent.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={watch("spikeDetectionEnabled")}
                id="alert-spike-enabled"
                onCheckedChange={(checked) =>
                  setValue("spikeDetectionEnabled", checked === true)
                }
              />
              <div>
                <Label htmlFor="alert-spike-enabled">
                  Cảnh báo tăng đột biến
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  So sánh chi phí hôm nay với trung bình 7 ngày gần nhất.
                </p>
              </div>
            </div>
            {watch("spikeDetectionEnabled") ? (
              <div className="space-y-2">
                <Label htmlFor="alert-spike-percent">
                  Ngưỡng tăng đột biến (%)
                </Label>
                <Input
                  aria-invalid={Boolean(errors.spikeThresholdPercent)}
                  className="w-32"
                  id="alert-spike-percent"
                  min={1}
                  max={200}
                  onChange={(event) =>
                    setValue(
                      "spikeThresholdPercent",
                      Number(event.target.value),
                      { shouldDirty: true }
                    )
                  }
                  type="number"
                  value={watch("spikeThresholdPercent")}
                />
                {errors.spikeThresholdPercent ? (
                  <p className="text-xs text-destructive">
                    {errors.spikeThresholdPercent.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-xl border p-3">
            <Label>Kênh gửi cảnh báo</Label>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={watch("inAppEnabled")}
                id="alert-in-app-enabled"
                onCheckedChange={(checked) =>
                  setValue("inAppEnabled", checked === true)
                }
              />
              <Label htmlFor="alert-in-app-enabled">Trong ứng dụng</Label>
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={watch("emailEnabled")}
                  id="alert-email-enabled"
                  onCheckedChange={(checked) =>
                    setValue("emailEnabled", checked === true)
                  }
                />
                <Label htmlFor="alert-email-enabled">Email</Label>
              </div>
              {watch("emailEnabled") ? (
                <EmailChipList
                  onChange={(values) =>
                    setValue("emailRecipients", values, { shouldDirty: true })
                  }
                  values={watch("emailRecipients")}
                />
              ) : null}
              {errors.emailRecipients ? (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.emailRecipients)
                    ? errors.emailRecipients.find((e) => e?.message)?.message
                    : errors.emailRecipients.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 border-t pt-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={watch("slackEnabled")}
                  disabled={!setting.slackConfigured}
                  id="alert-slack-enabled"
                  onCheckedChange={(checked) =>
                    setValue("slackEnabled", checked === true)
                  }
                />
                <Label htmlFor="alert-slack-enabled">Slack</Label>
              </div>
              <p className="pl-7 text-xs text-muted-foreground">
                {setting.slackConfigured
                  ? `Đã cấu hình: #${setting.slackChannelLabel ?? "unknown"}`
                  : "Chưa cấu hình webhook trong env"}
              </p>
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

          <Button disabled={isBusy} type="submit">
            {isBusy ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
