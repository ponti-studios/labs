import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { HistoryGuestView, HistoryPageView } from "../components/pages/history-page";
import { buildMosaicFixture, emptyHistory, history } from "./fixtures";

const meta = { title: "Pages/History", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const mosaicCells = buildMosaicFixture(history.weekEndKey, 364, 7);

export const SignedOut: Story = {
  render: () => <HistoryGuestView loginUrl="/login" />,
};

export const WithHistory: Story = {
  render: () => (
    <HistoryPageView
      history={history}
      gameSlug="reality"
      mosaicCells={mosaicCells}
      onPageChange={fn()}
    />
  ),
};

export const NoMosaicYet: Story = {
  render: () => (
    <HistoryPageView history={history} gameSlug="reality" mosaicCells={[]} onPageChange={fn()} />
  ),
};

export const EmptyHistory: Story = {
  render: () => (
    <HistoryPageView
      history={emptyHistory}
      gameSlug="reality"
      mosaicCells={[]}
      onPageChange={fn()}
    />
  ),
};
