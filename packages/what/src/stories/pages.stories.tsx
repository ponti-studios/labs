import type { Meta, StoryObj } from "@storybook/react-vite";

import { HistoryPage } from "../components/pages/history-page";
import { emptyHistory, history } from "./fixtures";

const meta = { title: "Pages", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const HistorySignedOut: Story = {
  render: () => <HistoryPage signedIn={false} loginUrl="/login" gameSlug="reality" />,
};
export const HistoryEmpty: Story = {
  render: () => (
    <HistoryPage signedIn loginUrl="/login" gameSlug="reality" history={emptyHistory} />
  ),
};
export const HistoryPopulated: Story = {
  render: () => <HistoryPage signedIn loginUrl="/login" gameSlug="reality" history={history} />,
};
export const HistoryWithPagination: Story = {
  render: () => (
    <HistoryPage
      signedIn
      loginUrl="/login"
      gameSlug="reality"
      history={{
        ...history,
        playableUnplayedDateKeys: Array.from(
          { length: 21 },
          (_, i) => `2026-08-${String(i + 1).padStart(2, "0")}`,
        ),
      }}
    />
  ),
};
