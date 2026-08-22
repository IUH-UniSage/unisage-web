import type { Preview } from "@storybook/react-vite"

import "../src/styles/index.css"

const preview: Preview = {
  parameters: {
    a11y: {
      test: "todo",
    },
    backgrounds: {
      default: "UniSage",
      values: [
        { name: "UniSage", value: "#f7f8fb" },
        { name: "White", value: "#ffffff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
}

export default preview
