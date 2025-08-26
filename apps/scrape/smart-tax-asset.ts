import * as readline from "node:readline";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { env } from "../env.js";

function askQuestion(question: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

async function main() {
	// Get user input
	const income = await askQuestion("Enter household income: $");
	const location = await askQuestion("Enter location (city, state): ");

	const stagehand = new Stagehand({
		env: "LOCAL",
		logInferenceToFile: true,
		logger: (message) => console.log(message),
		modelName: "gpt-4o",
		modelClientOptions: {
			apiKey: env.OPENAI_API_KEY,
		},
	});
	await stagehand.init();

	const page = stagehand.page;

	await page.goto("https://smartasset.com/taxes/income-taxes");
	await page.act(`Type in ${income} into the Household Income field`);
	await page.act(`Type in ${location} into the Location field`);
	await page.act(`Click the ${location} option`);

	const data = await page.extract({
		instruction: "The title of the first search result",
		schema: z.object({
			Federal: z.string(),
			FICA: z.string(),
			State: z.string(),
			Local: z.string(),
			"Total Income Taxes": z.string(),
			"Income After Taxes": z.string(),
			"Retirement Contributions": z.string(),
			"Take-Home Pay": z.string(),
		}),
	});

	console.log("Title of first search result:", JSON.stringify(data, null, 2));
	await stagehand.close();
}

main();
