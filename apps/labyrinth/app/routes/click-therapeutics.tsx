import { useState, type JSX } from "react";

interface Vote {
  name: string;
  timestamp: number;
}

interface WinningCandidate {
  candidate: string;
  votes: number;
}

type VotingResult = string[] | WinningCandidate;

const sampleVotes: Vote[] = [
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

function findWinningCandidate(
  votes: Vote[],
  timestamp: number,
  numOfCandidates: number,
): VotingResult {
  const voteCount: Record<string, number> = {};

  for (const vote of votes) {
    if (vote.timestamp < timestamp) {
      voteCount[vote.name] = (voteCount[vote.name] || 0) + 1;
    }
  }

  if (numOfCandidates > 0) {
    return Object.keys(voteCount)
      .sort((leftName, rightName) => voteCount[rightName] - voteCount[leftName])
      .slice(0, numOfCandidates);
  }

  return Object.entries(voteCount).reduce<WinningCandidate>(
    (currentWinner, [candidate, count]) =>
      count > currentWinner.votes ? { candidate, votes: count } : currentWinner,
    { candidate: "", votes: 0 },
  );
}

export default function ClickTherapeutics(): JSX.Element {
  const [timestamp, setTimestamp] = useState(15);
  const [numCandidates, setNumCandidates] = useState(3);
  const [result, setResult] = useState<VotingResult | null>(null);

  const run = (): void => {
    setResult(findWinningCandidate(sampleVotes, timestamp, numCandidates));
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
            onChange={(event) => setTimestamp(Number(event.target.value))}
            style={{ marginLeft: "0.5rem", padding: "0.25rem", width: "60px" }}
          />
        </label>
        <label>
          Top N:
          <input
            type="number"
            value={numCandidates}
            onChange={(event) => setNumCandidates(Number(event.target.value))}
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
            {sampleVotes.map((vote, index) => (
              <tr
                key={`${vote.name}-${vote.timestamp}-${index}`}
                style={{ background: vote.timestamp < timestamp ? "#d4edda" : "transparent" }}
              >
                <td style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>
                  {vote.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}>
                  {vote.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result !== null && (
        <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
          {Array.isArray(result) ? (
            <>
              <h4>Leaderboard (Top {numCandidates}):</h4>
              <ol>
                {result.map((candidate) => (
                  <li key={candidate}>{candidate}</li>
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