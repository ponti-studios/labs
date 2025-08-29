import { GoogleGenAI } from "@google/genai";
import { env } from "~/env";

const ai = new GoogleGenAI({ apiKey: env.VITE_GOOGLE_API_KEY });

export async function generateEmbedding(content: string): Promise<number[]> {
	try {
		if (!env.VITE_GOOGLE_API_KEY) {
			throw new Error("GOOGLE_API_KEY is required for embedding generation");
		}

		const result = await ai.models.embedContent({
			model: "gemini-embedding-001",
			contents: [content],
			config: { taskType: "SEMANTIC_SIMILARITY" },
		});
		const embedding = result.embeddings?.[0]?.values;

		return embedding ?? [];
	} catch (error) {
		console.error("Error generating embedding:", error);
		throw new Error(
			`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function generateTaskEmbedding(
	todoTitle: string,
	projectName?: string,
): Promise<number[]> {
	// Create a more descriptive content for better embeddings
	const content = projectName
		? `Task: ${todoTitle} | Project: ${projectName}`
		: `Task: ${todoTitle}`;

	return generateEmbedding(content);
}
