import { Input } from "@ponti-studios/ui/forms";
import { Label } from "@ponti-studios/ui/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ponti-studios/ui/data-display";
import { useState, type JSX } from "react";
import { Button } from "@ponti-studios/ui/primitives";

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

/**
 * Click Therapeutics Take-Home Challenge
 *
 * Task: Design an algorithm to process a list of votes and find the winning candidate
 * or top N candidates based on votes cast before a specific timestamp.
 */
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

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Label>
          Timestamp:
          <Input
            type="number"
            value={timestamp}
            onChange={(event) => setTimestamp(Number(event.target.value))}
          />
        </Label>
        <Label>
          Top N:
          <Input
            type="number"
            value={numCandidates}
            onChange={(event) => setNumCandidates(Number(event.target.value))}
          />
        </Label>
        <Button onClick={run}>Run</Button>
      </div>

      <div className="mb-4">
        <h4>Votes:</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleVotes.map((vote, index) => (
              <TableRow
                key={`${vote.name}-${vote.timestamp}-${index}`}
                className={vote.timestamp < timestamp ? "bg-green-100" : undefined}
              >
                <TableCell>{vote.name}</TableCell>
                <TableCell>{vote.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {result !== null && (
        <div className="rounded bg-[#f0f0f0] p-4">
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
