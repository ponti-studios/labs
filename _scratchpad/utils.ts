import type { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";
import type { BaseLanguageModelInput } from "langchain/base_language";
import type { HttpResponseOutputParser } from "langchain/output_parsers";
import type { PromptTemplate } from "langchain/prompts";
import type { Runnable } from "langchain/runnables";
import type { AIMessageChunk } from "langchain/schema";

export function createChainFromModel(
	model:
		| ChatOpenAI
		| Runnable<BaseLanguageModelInput, AIMessageChunk, ChatOpenAICallOptions>,
	prompt: PromptTemplate,
	parser: HttpResponseOutputParser,
) {
	return prompt.pipe(model).pipe(parser);
}

export const DEFAULT_MODEL_OPTIONS = {
	apiKey: process.env.OPENAI_API_KEY!,
	model: "gpt-3.5-turbo",
	// model: "gpt-4o",
	temperature: 0.8,
};
