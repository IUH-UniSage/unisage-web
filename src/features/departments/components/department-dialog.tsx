import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"
import { useMemo, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  departmentRequestSchema,
  type Department,
  type DepartmentNode,
  type DepartmentRequest,
} from "@/features/departments/schemas/department-schemas"
import {
  collectSubtreeIds,
  flattenDepartmentTreeWithDepth,
  getUnitTypeByDepth,
  UNIT_TYPE_LABELS,
  type DepartmentUnitType,
} from "@/features/departments/utils/tree"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

// Unit "type" isn't a stored field — it's derived purely from where a node
// sits in the hierarchy (depth 0/1/2). This map is only used to constrain
// which parent depth is valid for each type when creating/moving a unit.
const ALLOWED_PARENT_DEPTH: Record<DepartmentUnitType, number> = {
  department: 1,
  faculty: 0,
  office: -1,
}

const UNIT_TYPE_ORDER: DepartmentUnitType[] = [
  "office",
  "faculty",
  "department",
]

type DepartmentDialogProps = {
  department?: Department
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: DepartmentRequest) => Promise<void>
  open: boolean
  presetParentId?: string
  tree: DepartmentNode[]
}

export function DepartmentDialog({
  department,
  isSaving,
  onOpenChange,
  onSubmit,
  open,
  presetParentId,
  tree,
}: DepartmentDialogProps) {
  // Prevent selecting self or any descendant as parent to avoid cycles
  const disabledParentIds = useMemo(() => {
    if (!department) return new Set<string>()
    return collectSubtreeIds(department)
  }, [department])

  // Flatten tree for hierarchical dropdown
  const flatOptions = useMemo(
    () => flattenDepartmentTreeWithDepth(tree),
    [tree]
  )

  const initialParentId = department?.parentId ?? presetParentId ?? null

  const [selectedType, setSelectedType] = useState<DepartmentUnitType>(() => {
    if (department) {
      const depth = flatOptions.find((opt) => opt.id === department.id)?.depth
      return getUnitTypeByDepth(depth ?? 0)
    }
    if (presetParentId) {
      const parentDepth = flatOptions.find(
        (opt) => opt.id === presetParentId
      )?.depth
      return getUnitTypeByDepth((parentDepth ?? -1) + 1)
    }
    return "office"
  })

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<DepartmentRequest>({
    defaultValues: {
      description: department?.description ?? null,
      name: department?.name ?? "",
      parentId: initialParentId,
    },
    resolver: zodResolver(departmentRequestSchema),
  })

  const selectedParentId = watch("parentId")
  const isBusy = isSaving || isSubmitting

  const allowedParentDepth = ALLOWED_PARENT_DEPTH[selectedType]
  const requiresParent = allowedParentDepth >= 0
  const parentOptions = useMemo(
    () =>
      flatOptions.filter(
        (opt) =>
          opt.depth === allowedParentDepth && !disabledParentIds.has(opt.id)
      ),
    [allowedParentDepth, disabledParentIds, flatOptions]
  )
  const parentMissing = requiresParent && !selectedParentId

  const selectedParentName = useMemo(() => {
    if (!selectedParentId) return undefined
    return flatOptions.find((opt) => opt.id === selectedParentId)?.name
  }, [flatOptions, selectedParentId])

  const handleTypeChange = (type: DepartmentUnitType) => {
    setSelectedType(type)
    const nextAllowedDepth = ALLOWED_PARENT_DEPTH[type]
    if (nextAllowedDepth < 0) {
      setValue("parentId", null, { shouldDirty: true })
      return
    }
    const currentParentDepth = flatOptions.find(
      (opt) => opt.id === selectedParentId
    )?.depth
    if (currentParentDepth !== nextAllowedDepth) {
      setValue("parentId", null, { shouldDirty: true })
    }
  }

  const submit = async (values: DepartmentRequest) => {
    if (parentMissing) return

    try {
      await onSubmit({
        description: values.description?.trim() || null,
        name: values.name.trim(),
        parentId: values.parentId || null,
      })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Cập nhật thông tin đơn vị hoặc điều chỉnh vị trí phân cấp."
              : "Tạo đơn vị mới trong sơ đồ tổ chức của UniSage."}
          </DialogDescription>
        </DialogHeader>

        {presetParentId && !department && selectedParentName ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Đang thêm đơn vị trực thuộc</p>
              <p className="mt-0.5 text-muted-foreground">
                Đơn vị mới sẽ thuộc:{" "}
                <strong className="text-foreground">
                  {selectedParentName}
                </strong>
              </p>
            </div>
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <div className="space-y-3.5 rounded-xl border bg-card/60 p-3.5">
            {/* Unit type */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-type" className="text-xs font-semibold">
                Loại đơn vị
              </Label>
              <Select
                onValueChange={(value) =>
                  handleTypeChange(value as DepartmentUnitType)
                }
                value={selectedType}
              >
                <SelectTrigger
                  id="dept-type"
                  aria-label="Chọn loại đơn vị"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPE_ORDER.map((type) => (
                    <SelectItem key={type} value={type}>
                      {UNIT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-name" className="text-xs font-semibold">
                Tên đơn vị <span className="text-destructive">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(errors.name)}
                autoFocus
                id="dept-name"
                placeholder="Ví dụ: Phòng Công nghệ Thông tin"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            {/* Hierarchical Parent Selector */}
            {requiresParent ? (
              <div className="space-y-1.5">
                <Label htmlFor="dept-parent" className="text-xs font-semibold">
                  Trực thuộc <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(val) =>
                    setValue("parentId", val, { shouldDirty: true })
                  }
                  value={selectedParentId ?? undefined}
                >
                  <SelectTrigger
                    id="dept-parent"
                    aria-label="Chọn đơn vị cha"
                    aria-invalid={parentMissing}
                    className="w-full"
                  >
                    <SelectValue placeholder="Chọn đơn vị cha..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {parentOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {parentMissing ? (
                  <p className="text-xs text-destructive">
                    Vui lòng chọn đơn vị cha phù hợp.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Đây là đơn vị cấp cao nhất, không có đơn vị cha.
              </p>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-desc" className="text-xs font-semibold">
                Mô tả chức năng
              </Label>
              <Textarea
                id="dept-desc"
                rows={3}
                placeholder="Mô tả chức năng, nhiệm vụ và phạm vi công tác của đơn vị..."
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>
          </div>

          {errors.root?.message ? (
            <p
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              role="alert"
            >
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button disabled={isBusy} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button disabled={isBusy || parentMissing} type="submit">
              {isBusy
                ? "Đang lưu..."
                : department
                  ? "Lưu thay đổi"
                  : "Tạo đơn vị"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
