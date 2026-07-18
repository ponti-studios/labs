import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { EntitySelect } from "./entity-select";

const meta = {
  title: "Forms/EntitySelect",
  component: EntitySelect,
  tags: ["autodocs"],
} satisfies Meta<typeof EntitySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { id: "checking", name: "Checking" },
  { id: "savings", name: "Savings" },
  { id: "credit-card", name: "Credit Card" },
];

function EntitySelectPreview() {
  const [value, setValue] = useState("all");
  return (
    <EntitySelect
      value={value}
      onValueChange={setValue}
      options={options}
      allOptionLabel="All accounts"
      placeholder="All accounts"
      label="Account"
      showLabel
    />
  );
}

export const Default: Story = {
  args: {
    value: "all",
    onValueChange: () => {},
    options,
  },
  render: () => <EntitySelectPreview />,
};

export const Loading: Story = {
  args: {
    value: "all",
    onValueChange: () => {},
    options: [],
    isLoading: true,
    label: "Account",
    showLabel: true,
  },
};

export const Empty: Story = {
  args: {
    value: "all",
    onValueChange: () => {},
    options: [],
    label: "Account",
    showLabel: true,
    emptyLabel: "No accounts available",
  },
};
