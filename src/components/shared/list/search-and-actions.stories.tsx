import { Filter, Plus } from "lucide-react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { SearchAndActions } from "@/components/shared/list/search-and-actions"

const meta = {
  title: "Shared/SearchAndActions",
  component: SearchAndActions,
  args: {
    actions: [
      {
        icon: Filter,
        id: "filter",
        label: "Lọc kết quả",
        onClick: () => undefined,
      },
      {
        icon: Plus,
        id: "create",
        label: "Tạo mới",
        onClick: () => undefined,
      },
    ],
    className: "w-[420px]",
    placeholder: "Tìm tài liệu của trường",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchAndActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
