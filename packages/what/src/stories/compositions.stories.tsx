import type { Meta, StoryObj } from "@storybook/react-vite";

import { GameBoard, GameBoardSkeleton } from "../components/game";
import { DatePage } from "../components/pages/date-page";
import { fallbackPuzzle, guesses, puzzle } from "./fixtures";

const meta = { title: "Game/Compositions", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const common = { loginUrl: "/login", gameSlug: "reality" };

export const FreshBoard: Story = {
  render: () => <GameBoard {...common} puzzle={puzzle} initialGuesses={[]} />,
};
export const BoardWithGuesses: Story = {
  render: () => <GameBoard {...common} puzzle={puzzle} initialGuesses={guesses} />,
};
export const FallbackBoard: Story = {
  render: () => <GameBoard {...common} puzzle={fallbackPuzzle} initialGuesses={[]} />,
};
export const BoardWithTopics: Story = {
  render: () => (
    <GameBoard
      {...common}
      puzzle={puzzle}
      initialGuesses={[]}
      topics={[
        { slug: "reality", name: "Reality" },
        { slug: "culture", name: "Culture" },
      ]}
    />
  ),
};
export const BoardSkeleton: Story = { render: () => <GameBoardSkeleton /> };
export const SignedOutDatePage: Story = {
  render: () => <DatePage {...common} puzzle={puzzle} attempt={null} signedIn={false} />,
};
export const SignedInDatePage: Story = {
  render: () => (
    <DatePage {...common} puzzle={puzzle} attempt={{ guesses, status: "playing" }} signedIn />
  ),
};
