import type { Meta, StoryObj } from "@storybook/react-vite";

import { FilterChip } from "./filter-chip";

const meta = {
  title: "DataDisplay/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  args: {
    onRemove: () => {},
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Status: Active" },
};

export const Editable: Story = {
  args: { label: "Status: Active", onClick: () => {} },
};

export const LongLabel: Story = {
  args: { label: "Created between Jan 1, 2026 and Jul 24, 2026" },
};

export const Group: Story = {
  args: { label: "Filters" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <FilterChip label="Status: Active" onRemove={() => {}} onClick={() => {}} />
      <FilterChip label="Team: Design" onRemove={() => {}} onClick={() => {}} />
      <FilterChip label="Archived" onRemove={() => {}} />
    </div>
  ),
};
