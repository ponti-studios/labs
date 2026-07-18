import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { GroupBySelect } from "./group-by-select";

const meta = {
  title: "Forms/GroupBySelect",
  component: GroupBySelect,
  tags: ["autodocs"],
} satisfies Meta<typeof GroupBySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function GroupBySelectPreview() {
  const [groupBy, setGroupBy] = useState<"month" | "week" | "day">("month");
  return <GroupBySelect groupBy={groupBy} onGroupByChange={setGroupBy} />;
}

export const Default: Story = {
  args: {
    groupBy: "month",
    onGroupByChange: () => {},
  },
  render: () => <GroupBySelectPreview />,
};
