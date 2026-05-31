import { useCallback, useState, type JSX } from "react";
import { Button } from "@pontistudios/ui";

const prizes = ["A Unicorn!", "A Hug!", "Fresh Laundry!"] as const;

/**
 * Interview Cake Take-Home Challenge
 *
 * Task: Create a React component that demonstrates and resolves the classic JavaScript
 * closure scoping issue within loops, ensuring each button shows its corresponding prize.
 */
export default function InterviewCake(): JSX.Element {
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const index = parseInt(button.dataset.value ?? "0", 10);
    setMessage(`You won: ${prizes[index]}!`);
  }, []);

  return (
    <div>
      <h2>Interview Cake - Closure Scope</h2>
      <p>Classic closure demo: each button should show its corresponding prize.</p>
      {message && (
        <div className="p-4 bg-[#d4edda] border border-[1px solid #c3e6cb] rounded-[4px] mb-4">
          {message}
        </div>
      )}
      <div className="flex gap-4">
        {prizes.map((_, index) => (
          <Button key={index} type="button" data-value={index} onClick={handleClick}>
            Button {index + 1}!
          </Button>
        ))}
      </div>
    </div>
  );
}
