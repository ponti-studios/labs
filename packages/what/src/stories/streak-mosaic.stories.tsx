import type { Meta, StoryObj } from "@storybook/react-vite";

import { StreakMosaic } from "../components/game";
import { buildMosaicFixture } from "./fixtures";

const meta = { title: "Game/StreakMosaic", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const TODAY = "2026-08-27";
const FULL_YEAR_DAYS = 364;

export const FiftyTwoWeeks: Story = {
  render: () => <StreakMosaic cells={buildMosaicFixture(TODAY, FULL_YEAR_DAYS, 7)} />,
};

export const CurrentStreak: Story = {
  render: () => {
    const cells = buildMosaicFixture(TODAY, FULL_YEAR_DAYS, 7);
    // Force the last 9 days (before today's in-progress cell) into an
    // unbroken solved streak, so the "unbroken pink run" read is obvious.
    for (let i = cells.length - 1; i >= Math.max(0, cells.length - 9); i--) {
      if (cells[i].status === "playing") continue;
      cells[i] = { ...cells[i], status: "solved", guessCount: 1 + ((cells.length - i) % 6) };
    }
    return <StreakMosaic cells={cells} />;
  },
};

export const NewPlayer: Story = {
  // The game always renders the full 52-week grid, even for a player (or a
  // game) that's only existed for two weeks — most of it reads unplayed.
  render: () => <StreakMosaic cells={buildMosaicFixture(TODAY, FULL_YEAR_DAYS, 3, 14)} />,
};

export const Empty: Story = {
  render: () => <StreakMosaic cells={[]} />,
};
