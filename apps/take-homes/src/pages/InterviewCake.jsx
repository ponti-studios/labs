import { useState } from "react";

const prizes = ["A Unicorn!", "A Hug!", "Fresh Laundry!"];

export default function InterviewCake() {
  const [message, setMessage] = useState(null);

  const handleClick = (n) => {
    setMessage(`You won: ${prizes[n]}!`);
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
        {prizes.map((_, i) => (
          <button
            key={i}
            type="button"
            className="btn btn-primary"
            onClick={() => handleClick(i)}
          >
            Button {i + 1}!
          </button>
        ))}
      </div>
    </div>
  );
}
