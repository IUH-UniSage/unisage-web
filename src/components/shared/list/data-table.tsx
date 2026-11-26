import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { cn } from "@/lib/utils"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by TanStack's module augmentation API
  interface ColumnMeta<TData, TValue> {
    className?: string
    headerClassName?: string
  }
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId?: (row: TData) => string
}

// The row-actions column stays pinned to the right edge, so on a laptop-width
// screen where the table scrolls sideways the "…" menu is still reachable.
const ACTIONS_COLUMN_ID = "actions"
const STICKY_HEAD_CLASSNAME =
  "sticky right-0 z-10 border-l bg-card bg-linear-to-r from-muted/45 to-muted/45"
const STICKY_CELL_CLASSNAME =
  "sticky right-0 z-10 border-l bg-card group-hover/row:bg-linear-to-r group-hover/row:from-muted/35 group-hover/row:to-muted/35"

export function DataTable<TData>({
  columns,
  data,
  getRowId,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  return (
    <Table {...tourAnchor(TOUR_ANCHORS.dataTable)}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                className={cn(
                  header.column.id === ACTIONS_COLUMN_ID &&
                    STICKY_HEAD_CLASSNAME,
                  header.column.columnDef.meta?.headerClassName
                )}
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow className="group/row" key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                className={cn(
                  cell.column.id === ACTIONS_COLUMN_ID && STICKY_CELL_CLASSNAME,
                  cell.column.columnDef.meta?.className
                )}
                key={cell.id}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
