import { cn } from "@pontistudios/ui";

export function MatchScore(score: number) {
  if (!score) {
    return null;
  }

  return (
    <span
      className={cn("text-muted-foreground text-sm font-normal", {
        "bg-yellow-300 text-black": score > 20 && score < 50,
        "bg-green-300 text-black": score >= 50,
      })}
    >
      Match: {Math.round(score)}%
    </span>
  );
}
