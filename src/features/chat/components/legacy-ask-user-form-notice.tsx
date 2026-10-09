import type { LegacyAskUserForm } from "@/features/chat/utils/legacy-ask-user-form"

type LegacyAskUserFormNoticeProps = {
  form: LegacyAskUserForm
}

// Old replies ended with an in-message form; it is listed read-only so the
// history still reads right. Never interactive, never opens the panel.
export function LegacyAskUserFormNotice({
  form,
}: LegacyAskUserFormNoticeProps) {
  return (
    <div className="mt-2 space-y-2 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
      <p className="font-medium text-muted-foreground">
        Câu hỏi bổ sung (phiên bản cũ)
      </p>
      <ul className="space-y-1.5">
        {form.fields.map((field) => (
          <li key={field.field}>
            <span className="text-foreground">{field.label}</span>
            {field.options.length ? (
              <span className="text-muted-foreground">
                {": "}
                {field.options.map((option) => option.label).join(" · ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
