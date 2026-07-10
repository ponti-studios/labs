export type EngageProblemId = "launch" | "modernize" | "unblock" | "content" | "judgment";

export type EngageProblem = {
  id: EngageProblemId;
  label: string;
  /** The bridge line — states the problem back in plain language before the answer. */
  description: string;
  /** Short, punchy framing for this specific problem, not a generic engagement-mode label. */
  answerEyebrow: string;
  /** The actual answer — written for this problem, never reused across problems. */
  answerBody: string;
  deliverables: readonly string[];
  cta: string;
  proofSlug: string;
  /** Which of that case study's outcomes to lead with. Defaults to 0. */
  proofOutcomeIndex?: number;
};

export const engageProblems: readonly EngageProblem[] = [
  {
    id: "launch",
    label: "Launch something new",
    description: "A product, campaign, or internal tool needs to go from ambiguous brief to real.",
    answerEyebrow: "Ship the thing.",
    answerBody:
      "I turn an important bet into a real thing your team can use, sell, or put in front of customers — from a loose brief to something live.",
    deliverables: ["Scoped roadmap", "Working product", "Launch support"],
    cta: "Book a build call",
    proofSlug: "streamyard",
    proofOutcomeIndex: 0,
  },
  {
    id: "modernize",
    label: "Modernize the experience",
    description: "The current product works, but it feels dated, slow, brittle, or hard to evolve.",
    answerEyebrow: "Rebuild without a rewrite freeze.",
    answerBody:
      "I take what already works and make it fast, current, and easy to extend again — in shippable pieces, not a risky rewrite that freezes your roadmap for a year.",
    deliverables: ["Modernization plan", "Incremental migration", "Wins you can point to"],
    cta: "Book a modernization call",
    proofSlug: "lumina",
    proofOutcomeIndex: 0,
  },
  {
    id: "unblock",
    label: "Unblock growth",
    description: "A system, workflow, or team bottleneck is keeping a valuable bet from scaling.",
    answerEyebrow: "Find the bottleneck. Remove it.",
    answerBody:
      "I get close to the actual workflow, find the specific thing throttling throughput, and fix it — then stay close enough to keep it fixed as you scale.",
    deliverables: ["Bottleneck diagnosis", "A fix that ships", "A rhythm to keep it fixed"],
    cta: "Book a diagnostic call",
    proofSlug: "kensho",
    proofOutcomeIndex: 0,
  },
  {
    id: "content",
    label: "Sharpen content and positioning",
    description: "The work is good, but the market cannot yet understand why it matters.",
    answerEyebrow: "Make the value legible.",
    answerBody:
      "I sharpen the story until the value is obvious on first read — the positioning, the messaging, and the content that carries it — so people stop asking what this actually does.",
    deliverables: [
      "Positioning and messaging",
      "Content strategy",
      "A content calendar you can run",
    ],
    cta: "Book a positioning call",
    proofSlug: "streamyard",
    proofOutcomeIndex: 2,
  },
  {
    id: "judgment",
    label: "Get senior judgment",
    description:
      "The decision is expensive, political, or technically risky enough to need clarity.",
    answerEyebrow: "Get unstuck fast.",
    answerBody:
      "I examine the evidence, expose the real tradeoffs, and hand your team a decisive, defensible next move — not a deck that restates the problem back to you.",
    deliverables: ["Audit findings", "A tradeoff map", "A clear recommendation"],
    cta: "Book an advisory call",
    proofSlug: "thomson-reuters",
    proofOutcomeIndex: 0,
  },
];

export const DEFAULT_ENGAGE_PROBLEM = engageProblems[0];

export function findEngageProblem(id: string | null): EngageProblem {
  return engageProblems.find((problem) => problem.id === id) ?? DEFAULT_ENGAGE_PROBLEM;
}
