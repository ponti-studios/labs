import { cn } from "@pontistudios/ui";

export function MatchScore(score: number) {
  if (!score) {
    return null;
  }

  return (
    <span
      className={cn("ml-auto text-sm font-normal text-muted-foreground", {
        "bg-yellow-300 text-black": score > 20 && score < 50,
        "bg-green-300 text-black": score >= 50,
      })}
    >
      Match: {Math.round(score)}%
    </span>
  );
}
