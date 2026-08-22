import { ArrowRight } from "lucide-react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Tiếp tục",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Mở không gian làm việc
        <ArrowRight aria-hidden="true" />
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
