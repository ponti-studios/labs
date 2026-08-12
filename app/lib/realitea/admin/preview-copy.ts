const REASON_COPY: Array<{ match: string | RegExp; text: string }> = [
  { match: "unmatched-article", text: "The model didn’t point this word at one of the stories we sent." },
  { match: "answer must normalize to exactly five letters", text: "The answer isn’t exactly five letters." },
  { match: "answer does not normalize cleanly to letters", text: "The answer has characters we can’t use." },
  { match: "answer is not in the accepted five-letter word list", text: "That word isn’t in RealiTea’s dictionary." },
  { match: "answer type is missing", text: "The model didn’t say what kind of answer this is." },
  { match: "answer type must not be a person", text: "Names of people aren’t allowed. We need a storyline, place, or phrase." },
  { match: "answer is leaked in clue or detail", text: "The clue or detail gives the word away." },
  { match: "clue or detail contains prompt-control text", text: "The clue looks like it was talking to the model, not to a player." },
  { match: "answer repeats inside cooldown window", text: "We used this word too recently." },
  { match: "missing a", text: "The source URL doesn’t match the stories we offered." },
];

export function explainPreviewReason(reason: string): string {
  const hit = REASON_COPY.find((entry) =>
    typeof entry.match === "string" ? reason.includes(entry.match) : entry.match.test(reason),
  );
  return hit?.text ?? reason;
}

export function previewStagePercent(stage: string): number {
  switch (stage) {
    case "prepare":
      return 12;
    case "articles":
      return 28;
    case "model":
      return 62;
    case "score":
      return 86;
    case "done":
      return 100;
    default:
      return 8;
  }
}
