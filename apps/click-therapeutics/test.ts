interface Vote {
  name: string
  timestamp: number
}

interface VoteCount {
  [candidateName: string]: number
}

type Votes = Vote[]

/**
 * Retrieve either winning candidate, or list of candidates sorted by number of votes
 * @param votes Votes
 * @param timestamp
 * @param numOfCandidates Number of candidates to return
 */
function findWinningCandidate(votes: Votes, timestamp: number, numOfCandidates?: number) {
  // { 'CANDIDATE_NAME' : VOTE_COUNT, ... }
  let winningCount: number = 0;
  let candidate: string = '';

  const voteCount: VoteCount = {};

  for (let i = 0; i < votes.length; i += 1) {
    const vote = votes[i];

    // If timestamp is below one supplied, increase vote count for candidate
    if (vote.timestamp < timestamp) {
      voteCount[vote.name] = (voteCount[vote.name] || 0) + 1;
    }

    // If the current candidate has more votes than the current winner, set
    // winner to current candidate
    if (voteCount[vote.name] > winningCount) {
      winningCount = voteCount[vote.name];
      candidate = vote.name;
    }
  }

  if (numOfCandidates) {
    return (
      Object
        // Get names of candidates
        .keys(voteCount)
        // Sort candidates by number of votes
        .sort((candidateA, candidateB) => voteCount[candidateB] - voteCount[candidateA])
        // Return only candidates up to max
        .splice(0, numOfCandidates)
    );
  }

  return { candidate, votes: winningCount };
}

const input: Votes = [
  { name: 'John Doe', timestamp: 10 },
  { name: 'John Doe', timestamp: 11 },
  { name: 'Rick Doe', timestamp: 12 },
  { name: 'Rick Doe', timestamp: 12 },
  { name: 'Jane Doe', timestamp: 11 },
  { name: 'Jane Doe', timestamp: 14 },
  { name: 'John Doe', timestamp: 10 },
  { name: 'Jane Doe', timestamp: 14 },
  { name: 'Jane Doe', timestamp: 10 },
  { name: 'Rick Doe', timestamp: 15 },
  { name: 'Jane Doe', timestamp: 10 },
  { name: 'Rick Doe', timestamp: 15 },
  { name: 'Jane Doe', timestamp: 10 },
  { name: 'Rick Doe', timestamp: 15 },
];

console.log('Winner', findWinningCandidate(input, 15));
console.log('Leaderboard', findWinningCandidate(input, 15, 3));
