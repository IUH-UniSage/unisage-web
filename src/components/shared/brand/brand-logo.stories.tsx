import type { Meta, StoryObj } from "@storybook/react-vite"

import { BrandLogo } from "@/components/shared/brand/brand-logo"

const meta = {
  title: "Brand/BrandLogo",
  component: BrandLogo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BrandLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Workspace: Story = {
  args: {
    workspace: "Quản trị hệ thống",
  },
}

export const Inverse: Story = {
  args: {
    inverse: true,
    workspace: "Nạp tài liệu",
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-primary p-6">
        <Story />
      </div>
    ),
  ],
}
