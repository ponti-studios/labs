<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/47eb26a3-c779-4051-8880-2b7948643a2e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Start Ollama locally and pull the models you want to use, for example `ollama pull llama3.1` and `ollama pull llama3.2-vision`
3. Configure `VITE_OLLAMA_BASE_URL` and model names in [.env.local](.env.local)
   - Voice transcription and TTS are optional; set the matching Ollama model env vars if you have them, otherwise the app falls back where possible.
   - No sign-in or Firebase setup is required; chat history is stored locally in the browser.
4. Run the app:
   `npm run dev`
