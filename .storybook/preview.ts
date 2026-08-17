import type { Preview } from "@storybook/react-vite";

import "../app/app.css";
import "../app/routes/games/what/what.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default preview;
