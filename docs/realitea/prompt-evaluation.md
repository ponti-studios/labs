# RealiTea prompt evaluation

The prompt benchmark compares prompt files against the same fixed, cross-genre article fixtures. It is intentionally opt-in because it makes live OpenRouter calls.

Run the built-in comparison:

```bash
pnpm realitea:prompt-test
```

Run one prompt or compare custom prompts:

```bash
pnpm realitea:prompt-test --prompt-file=./app/lib/prompts/realitea-generation.md --prompt-file=./app/lib/prompts/realitea-generation-v2.md
```

The score measures whether the first selected valid answer is in the fixture's acceptable answer set. The `valid` count is a secondary signal: it shows how many candidates survive dictionary, length, leakage, safety, and source checks. A higher score is not enough by itself; inspect candidate wording and source grounding before promoting a prompt.

Prompt tests can also target a local Ollama model through its OpenAI-compatible endpoint:

```bash
pnpm realitea:prompt-test \
  --model=gemma4:e4b-mlx \
  --base-url=http://localhost:11434/v1 \
  --max-tokens=4000
```

Fixtures cover technology, celebrity, sports, and food. Add a fixture when a production failure reveals a new genre or failure mode, and keep acceptable answers deliberately broad only when multiple words are genuinely fair.
