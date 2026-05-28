import { useState, type JSX } from "react";

const prizes = ["A Unicorn!", "A Hug!", "Fresh Laundry!"] as const;

export default function InterviewCake(): JSX.Element {
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = (index: number): void => {
    setMessage(`You won: ${prizes[index]}!`);
  };

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
          <button
            key={index}
            type="button"
            className="btn btn-primary"
            onClick={() => handleClick(index)}
          >
            Button {index + 1}!
          </button>
        ))}
      </div>
    </div>
  );
}
