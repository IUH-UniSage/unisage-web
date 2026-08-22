import { Checkbox } from "@/components/ui/checkbox"

type ToggleOptionCardProps = {
  checked: boolean
  description: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

export function ToggleOptionCard({
  checked,
  description,
  label,
  onCheckedChange,
}: ToggleOptionCardProps) {
  return (
    <label className="flex items-start gap-3 rounded-xl border p-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  )
}
