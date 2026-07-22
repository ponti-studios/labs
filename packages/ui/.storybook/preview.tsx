import "../src/styles.css";
import type { Preview } from "@storybook/react-vite";
import { commonControlsExclude } from "../src/storybook/controls";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      exclude: commonControlsExclude,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      sort: "requiredFirst",
      expanded: true,
    },
    options: {
      storySort: {
        order: [
          "Audit",
          "Tokens",
          "Primitives",
          "Forms",
          "Feedback",
          "Navigation",
          "Patterns",
          "Surfaces",
          "Layouts",
          "Motion",
          "Internal",
        ],
      },
    },
  },
};

export default preview;
