import { useState } from "react";

function findWinningCandidate(votes, timestamp, numOfCandidates) {
  const voteCount = {};

  for (const vote of votes) {
    if (vote.timestamp < timestamp) {
      voteCount[vote.name] = (voteCount[vote.name] || 0) + 1;
    }
  }

  if (numOfCandidates) {
    return Object.keys(voteCount)
      .sort((a, b) => voteCount[b] - voteCount[a])
      .slice(0, numOfCandidates);
  }

  const winner = Object.entries(voteCount).reduce(
    (acc, [name, count]) => (count > acc.votes ? { candidate: name, votes: count } : acc),
    { candidate: "", votes: 0 },
  );

  return winner;
}

const sampleVotes = [
  { name: "John Doe", timestamp: 10 },
  { name: "John Doe", timestamp: 11 },
  { name: "Rick Doe", timestamp: 12 },
  { name: "Rick Doe", timestamp: 12 },
  { name: "Jane Doe", timestamp: 11 },
  { name: "Jane Doe", timestamp: 14 },
  { name: "John Doe", timestamp: 10 },
  { name: "Jane Doe", timestamp: 14 },
  { name: "Jane Doe", timestamp: 10 },
  { name: "Rick Doe", timestamp: 15 },
  { name: "Jane Doe", timestamp: 10 },
  { name: "Rick Doe", timestamp: 15 },
  { name: "Jane Doe", timestamp: 10 },
  { name: "Rick Doe", timestamp: 15 },
];

export default function ClickTherapeutics() {
  const [votes] = useState(sampleVotes);
  const [timestamp, setTimestamp] = useState(15);
  const [numCandidates, setNumCandidates] = useState(3);
  const [result, setResult] = useState(null);

  const run = () => {
    setResult(findWinningCandidate(votes, timestamp, numCandidates));
  };

  return (
    <div>
      <h2>Click Therapeutics - Voting</h2>
      <p>Find winning candidates based on votes before a timestamp.</p>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <label>
          Timestamp:
          <input
            type="number"
            value={timestamp}
            onChange={(e) => setTimestamp(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", padding: "0.25rem", width: "60px" }}
          />
        </label>
        <label>
          Top N:
          <input
            type="number"
            value={numCandidates}
            onChange={(e) => setNumCandidates(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", padding: "0.25rem", width: "60px" }}
          />
        </label>
        <button className="btn btn-primary" onClick={run}>
          Run
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4>Votes:</h4>
        <table style={{ borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((v, i) => (
              <tr
                key={i}
                style={{ background: v.timestamp < timestamp ? "#d4edda" : "transparent" }}
              >
                <td style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>{v.name}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>
                  {v.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && (
        <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
          {Array.isArray(result) ? (
            <>
              <h4>Leaderboard (Top {numCandidates}):</h4>
              <ol>
                {result.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h4>Winner:</h4>
              <p>
                {result.candidate} with {result.votes} votes
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
