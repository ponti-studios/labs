import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { GameHeader, GameResult, GuessGrid } from "../components/game";
import { OnscreenKeyboard } from "../components/keyboard/onscreen-keyboard";
import {
  authRequiredGame,
  errorGame,
  failedGame,
  gameState,
  guesses,
  puzzle,
  solvedGame,
} from "./fixtures";

const meta = { title: "Game/Components", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Keyboard: Story = {
  render: () => (
    <OnscreenKeyboard
      letterStates={{ A: "absent", R: "present", I: "correct" }}
      onLetter={fn()}
      onEnter={fn()}
      onBackspace={fn()}
    />
  ),
};
export const KeyboardDisabled: Story = { render: () => <OnscreenKeyboard disabled /> };
export const KeyboardReadOnly: Story = {
  render: () => (
    <OnscreenKeyboard readOnly letterStates={{ A: "absent", R: "present", I: "correct" }} />
  ),
};
export const KeyboardCallbacks: Story = {
  render: () => <OnscreenKeyboard onLetter={fn()} onEnter={fn()} onBackspace={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Q" }));
    await userEvent.click(canvas.getByRole("button", { name: "Enter guess" }));
    await userEvent.click(canvas.getByRole("button", { name: "Delete last letter" }));
  },
};

export const EmptyGrid: Story = { render: () => <GuessGrid game={gameState()} /> };
export const ActiveGrid: Story = {
  render: () => <GuessGrid game={gameState({ guesses, currentGuess: "DR" })} />,
};
export const ErrorGrid: Story = { render: () => <GuessGrid game={errorGame} /> };
export const SolvedGrid: Story = { render: () => <GuessGrid game={solvedGame} /> };
export const FailedGrid: Story = { render: () => <GuessGrid game={failedGame} /> };
export const ValidatingGrid: Story = {
  render: () => (
    <GuessGrid
      game={gameState({ guesses, currentGuess: "DRAMA", isValidationPending: true })}
    />
  ),
};
export const RevealingGrid: Story = {
  render: () => (
    <GuessGrid
      game={gameState({
        guesses,
        isRevealingRow: true,
        revealingGuessIndex: 0,
        revealedTileCount: 3,
      })}
    />
  ),
};

export const Header: Story = { render: () => <GameHeader isFallback={false} gameSlug="reality" /> };
export const HeaderWithTopics: Story = {
  render: () => (
    <GameHeader
      isFallback={false}
      gameSlug="reality"
      topics={[
        { slug: "reality", name: "Reality" },
        { slug: "culture", name: "Culture" },
      ]}
      onTopicChange={fn()}
    />
  ),
};
export const HeaderFallback: Story = { render: () => <GameHeader isFallback gameSlug="reality" /> };

function ResultStory({ game }: { game: typeof solvedGame }) {
  return (
    <GameResult
      game={game}
      puzzle={puzzle}
      loginUrl="https://auth.example.com/login"
      onShare={fn()}
      onCopy={fn()}
    />
  );
}
export const AuthRequired: Story = { render: () => <ResultStory game={authRequiredGame} /> };
export const SolvedResult: Story = { render: () => <ResultStory game={solvedGame} /> };
export const FailedResult: Story = { render: () => <ResultStory game={failedGame} /> };
export const ResultActions: Story = {
  render: () => {
    const share = fn();
    const copy = fn();
    return (
      <GameResult
        game={solvedGame}
        puzzle={puzzle}
        loginUrl="/login"
        onShare={share}
        onCopy={copy}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Share the drama" }));
    await userEvent.click(canvas.getByRole("button", { name: "Copy story" }));
    await expect(canvas.getByRole("link", { name: "Read the source article" })).toHaveAttribute(
      "href",
      puzzle.sources[0].url,
    );
  },
};

export const TypingHarness: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <GuessGrid game={gameState({ currentGuess: value })} />
        <OnscreenKeyboard
          onLetter={(letter) => setValue((current) => `${current}${letter}`.slice(0, 5))}
          onBackspace={() => setValue((current) => current.slice(0, -1))}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "D" }));
    await userEvent.click(canvas.getByRole("button", { name: "R" }));
    await expect(canvas.getByLabelText("Letter 1")).toHaveTextContent("D");
  },
};
