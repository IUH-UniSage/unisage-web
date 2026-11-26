import type { DepartmentNode } from "@/features/departments/schemas/department-schemas"

type LabelledDepartment = Pick<DepartmentNode, "description" | "name">

/**
 * The name to show a person for a department. In this data `name` holds the unit's code
 * (`BM_CONG_NGHE_PHAN_MEM`, `KHOA_CNTT`) and `description` its readable name ("Bộ môn Công
 * Nghệ Phần Mềm"); grouping nodes such as "Khoa" have no description, so the code is shown.
 * Keep `name` itself only where the code is what an admin types or must see (the form's name
 * input, the "Mã" line of the detail view).
 */
export function departmentLabel(department: LabelledDepartment): string {
  return department.description?.trim() || department.name
}
