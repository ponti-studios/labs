import { db, desc, rhobhDailyPuzzles } from "@pontistudios/db";

import {
  evaluateGuess,
  isGuessSolved,
  MAX_GUESSES,
  normalizeGuess,
  REALITEA_ANSWER_LENGTH,
  type PublicDailyPuzzle,
  type RealiteaGuessResult,
} from "./index";
import { addDaysToDateKey, getDateKey } from "./date";
import { createLogger } from "../logger.server";
import type { PuzzleRecord } from "./types";
import { loadPuzzleForDate } from "./repository";
import { isValidWord } from "../word-list.server";

const logger = createLogger();

// ── DTO mapping ──────────────────────────────────────────────────────────────

function toPublicDailyPuzzle(record: PuzzleRecord): PublicDailyPuzzle {
  return {
    answerType: record.answerType,
    clue: record.clue,
    dateKey: record.dateUtc ?? "",
    detail: record.detail,
    sources: record.sources ?? [],
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function loadActivePublicPuzzle(
  now: Date,
): Promise<{ puzzle: PublicDailyPuzzle } | null> {
  const dateKey = getDateKey(now);
  const childLogger = logger.child({
    operation: "loadActivePublicPuzzle",
    dateKey,
    timestamp: now.toISOString(),
  });

  let puzzle = await loadPuzzleForDate(dateKey);

  // Fallback: serve the most-recently created puzzle of any date
  if (!puzzle) {
    const row = await db.query.rhobhDailyPuzzles.findFirst({
      orderBy: desc(rhobhDailyPuzzles.createdAt),
    });
    if (row) {
      puzzle = row;
      childLogger.warn(
        {
          event: "[FALLBACK_ACTIVATED_ANY_PUZZLE]",
          puzzle_id: puzzle.id,
          intended_dateKey: dateKey,
          served_dateKey: puzzle.dateUtc,
        },
        "no puzzle for today; serving most recent puzzle as fallback",
      );
    }
  }

  if (!puzzle) {
    childLogger.error({ event: "[ERROR_NO_PUZZLE_AVAILABLE]" }, "no puzzle available");
    return null;
  }

  childLogger.info(
    {
      event: "[PUZZLE_AVAILABLE]",
      puzzle_id: puzzle.id,
      dateKey: puzzle.dateUtc,
    },
    "puzzle loaded",
  );
  return { puzzle: toPublicDailyPuzzle(puzzle) };
}

/**
 * Server-evaluates a guess. The answer never leaves the server: callers receive
 * per-letter states and the post-guess status only.
 */
export async function evaluateGuessServer(
  dateKey: string,
  rawWord: string,
  previousGuesses: readonly { word: string }[],
): Promise<RealiteaGuessResult> {
  const childLogger = logger.child({ operation: "evaluateGuessServer", requestedDateKey: dateKey });
  const word = normalizeGuess(rawWord);

  if (word.length !== REALITEA_ANSWER_LENGTH) {
    return { valid: false, word, reason: "wrong-length" };
  }

  if (previousGuesses.some((guess) => guess.word === word)) {
    return { valid: false, word, reason: "already-guessed" };
  }

  // Try exact dateKey, then previous day as grace period for midnight-rollover games
  let puzzle = await loadPuzzleForDate(dateKey);
  if (!puzzle) {
    const prevDateKey = addDaysToDateKey(dateKey, -1);
    if (prevDateKey) {
      puzzle = await loadPuzzleForDate(prevDateKey);
      if (puzzle) {
        childLogger.info(
          { event: "[GUESS_GRACE_PERIOD_ACCEPTED]", acceptedDateKey: prevDateKey, word },
          "guess accepted via previous-day grace period",
        );
      }
    }
  }

  if (!puzzle) {
    childLogger.warn({ event: "[GUESS_PUZZLE_NOT_FOUND]", word }, "no puzzle found for dateKey");
    return { valid: false, word, reason: "not-in-word-list" };
  }

  const inWordList = await isValidWord(word);
  if (!inWordList) {
    return { valid: false, word, reason: "not-in-word-list" };
  }

  const states = evaluateGuess(puzzle.answer, word);
  const isSolved = isGuessSolved({ word, states });
  const guessCount = previousGuesses.length + 1;
  const isGameOver = isSolved || guessCount >= MAX_GUESSES;
  const status: RealiteaGuessResult["status"] = isSolved
    ? "solved"
    : guessCount >= MAX_GUESSES
      ? "failed"
      : "playing";

  return { valid: true, word, states, isSolved, isGameOver, status };
}
