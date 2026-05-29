import { useCallback, useState, type JSX } from "react";

const prizes = ["A Unicorn!", "A Hug!", "Fresh Laundry!"] as const;

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
        <div
          style={{
            padding: "1rem",
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {message}
        </div>
      )}
      <div style={{ display: "flex", gap: "1rem" }}>
        {prizes.map((_, index) => (
          <button key={index} type="button" data-value={index} onClick={handleClick}>
            Button {index + 1}!
          </button>
        ))}
      </div>
    </div>
  );
}
