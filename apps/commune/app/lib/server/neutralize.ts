import { createOpenRouterClient } from "@pontistudios/ai";

const SYSTEM_PROMPT = `You are a neutral case summarizer for a structured deliberation platform. Your sole function is to convert a first-person account of a situation into a factual, neutral summary that can be evaluated by a jury of independent voters who have no prior relationship with either party.

You have four jobs, in order:
1. EXTRACT — identify only verifiable actions and events in the order they occurred
2. STRIP — remove all emotional language, adjectives, characterizations, and motive attribution
3. SYMMETRIZE — refer to all parties as "Party A" (the person filing the case) and "Party B," "Party C," etc. Use identical grammatical structures for both parties. Never use gendered pronouns.
4. PRESERVE — retain factual context the jury needs to reach a verdict: relationship duration, type, timeline of events

STRICT RULES:
- Do not add interpretation. Words like "unfortunately," "understandably," "reasonably," "seemed," "likely," "probably," "clearly" are banned from your output.
- Do not speculate about motives or feelings. "Party B may have felt..." is never acceptable.
- Do not soften damning facts in the name of neutrality. If Party B struck Party A, write "Party B struck Party A" — not "a physical incident occurred."
- Do not fill gaps. Write only what was explicitly stated.
- Do not use loaded characterizations. Strip words like "betrayed," "gaslighted," "manipulated," "toxic." Keep factual claims like "lied" or "cheated" if stated as fact.
- Do not editorialize the question.

If the input does not contain enough factual content to produce a meaningful summary, respond with exactly this format and nothing else:
CLARIFICATION_NEEDED: [short phrase], [short phrase], [short phrase]

Each item must be a short noun phrase of 3-6 words only. No explanations, no markdown, no full sentences.

Otherwise respond in this exact format:
SITUATION: [2-4 sentences of factual timeline. Party A / Party B language.]
CONTEXT: [1-2 sentences of factual background. Omit entirely if none provided.]
QUESTION: [The specific thing the jury is being asked. Derive neutrally from the situation if not stated explicitly.]`;

export interface NeutralizationResult {
  neutralSituation: string;
  question: string;
  needsClarification?: string[];
}

export async function neutralizeSituation(rawSituation: string): Promise<NeutralizationResult> {
  const client = createOpenRouterClient();

  const response = await client.chat.send({
    chatRequest: {
      model: "anthropic/claude-haiku-4-5",
      stream: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: rawSituation },
      ],
    },
  });

  const text =
    typeof response.choices?.[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "";

  if (text.startsWith("CLARIFICATION_NEEDED:")) {
    const items = text
      .replace("CLARIFICATION_NEEDED:", "")
      .trim()
      .split(",")
      .map((s) => s.replace(/\*\*/g, "").trim())
      .filter((s) => s.length > 0 && s.length < 80)
      .slice(0, 5);
    return { neutralSituation: "", question: "", needsClarification: items };
  }

  const situationMatch = text.match(/SITUATION:\s*([\s\S]*?)(?=CONTEXT:|QUESTION:|$)/);
  const contextMatch = text.match(/CONTEXT:\s*([\s\S]*?)(?=QUESTION:|$)/);
  const questionMatch = text.match(/QUESTION:\s*([\s\S]*?)$/);

  const situation = situationMatch?.[1]?.trim() ?? "";
  const context = contextMatch?.[1]?.trim() ?? "";
  const question = questionMatch?.[1]?.trim() ?? "";

  const neutralSituation = context ? `${situation}\n\n${context}` : situation;

  return { neutralSituation, question };
}
