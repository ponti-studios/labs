import type { Meta, StoryObj } from "@storybook/react-vite";

import { RouteLink } from "./route-link";

const meta = {
  title: "Navigation/RouteLink",
  component: RouteLink,
  tags: ["autodocs"],
} satisfies Meta<typeof RouteLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "View accounts",
    href: "#",
    className: "text-accent underline",
  },
};

export const WithOnNavigate: Story = {
  name: "With onNavigate callback",
  args: {
    children: "Go to analytics",
    href: "#",
    className: "text-accent underline",
    onNavigate: () => console.log("route loading started"),
  },
};
