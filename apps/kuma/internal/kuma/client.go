// Package kuma provides OpenRouter AI client for Kuma
package kuma

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client communicates with OpenRouter API
type Client struct {
	apiKey     string
	model      string
	baseURL    string
	httpClient *http.Client
}

// NewClient creates a new OpenRouter client
func NewClient(apiKey, model string) *Client {
	return &Client{
		apiKey:  apiKey,
		model:   model,
		baseURL: "https://openrouter.ai/api/v1",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Request represents a chat request
type Request struct {
	Messages []Message `json:"messages"`
}

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Response represents a chat response
type Response struct {
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

// Choice represents a single response choice
type Choice struct {
	Message Message `json:"message"`
}

// Usage represents token usage
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// Generate creates a chat completion
func (c *Client) Generate(ctx context.Context, messages []Message) (string, error) {
	reqBody := Request{
		Messages: messages,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST",
		fmt.Sprintf("%s/chat/completions", c.baseURL),
		bytes.NewReader(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("HTTP-Referer", "https://cosmic-oracle.local")
	req.Header.Set("X-Title", "Kuma")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	var result Response
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no choices returned")
	}

	return result.Choices[0].Message.Content, nil
}

// GenerateWithSystemPrompt creates a chat completion with a system prompt
func (c *Client) GenerateWithSystemPrompt(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	messages := []Message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}
	return c.Generate(ctx, messages)
}

// OracleSystemPrompt is the base prompt for the cosmic oracle
const OracleSystemPrompt = `You are Kuma - a surreal, absurd, but oddly wise spiritual guide. 

Your personality:
- Mystical but unhinged
- Speak in riddles and cosmic metaphors
- Include at least one bad pun or absurdist observation
- Occasionally reference LA/Silver Lake specifically
- Be reassuring but useless
- Never give direct advice - always speak in metaphors

Example responses:
- "The stars whisper of parking spaces... but they speak in a language only the universe understands. Check the 4th street."
- "Your subconscious manifests as a taco flying over a desk. This means you crave cylindrical nutrition. Or victory."
- "The cosmos has spoken. It said 'meh'. But also 'maybe'. And also 'nice try'."

Never break character. The cosmos does not give straight answers.`

// DreamPrompt is the prompt for dream interpretation
const DreamPrompt = `You are interpreting a user's dream from a cosmic, surreal perspective. Be absurd but oddly meaningful. Include at least one unexpected interpretation. End with a cosmic observation.`

// ManifestPrompt is the prompt for manifestation
const ManifestPrompt = `You are generating a cosmic manifestation affirmation. Make it absurd, specific but useless, and oddly empowering. Include at least one surreal element. Start with "The universe shall deliver unto you..."`

// FortunePrompt is the prompt for fortune reading
const FortunePrompt = `You are giving a useless but spiritually significant fortune. Make it bizarre, cryptic, and completely unhelpful. Include a warning about something trivial. End with "The cosmos is watching."`

// GuidancePrompt is the prompt for life guidance
const GuidancePrompt = `You are providing cosmic guidance for a life question. Respond in riddles, metaphors, and absurdist wisdom. Reference the question but never answer it directly. Include a cosmic observation about the nature of existence.`

// GenerateDream interprets a dream
func (c *Client) GenerateDream(ctx context.Context, dream string) (string, error) {
	return c.GenerateWithSystemPrompt(ctx, OracleSystemPrompt+"\n\n"+DreamPrompt,
		fmt.Sprintf("Interpret this dream: %s", dream))
}

// GenerateManifestation creates a manifestation affirmation
func (c *Client) GenerateManifestation(ctx context.Context, desire string) (string, error) {
	return c.GenerateWithSystemPrompt(ctx, OracleSystemPrompt+"\n\n"+ManifestPrompt,
		fmt.Sprintf("Generate a cosmic manifestation for this desire: %s", desire))
}

// GenerateFortune gives a fortune
func (c *Client) GenerateFortune(ctx context.Context) (string, error) {
	return c.GenerateWithSystemPrompt(ctx, OracleSystemPrompt+"\n\n"+FortunePrompt,
		"Give me my cosmic fortune")
}

// GenerateGuidance provides guidance
func (c *Client) GenerateGuidance(ctx context.Context, question string) (string, error) {
	return c.GenerateWithSystemPrompt(ctx, OracleSystemPrompt+"\n\n"+GuidancePrompt,
		fmt.Sprintf("Give me cosmic guidance on: %s", question))
}

// GenerateGeneral handles general messages
func (c *Client) GenerateGeneral(ctx context.Context, message, userName string, contextMessages []Message) (string, error) {
	var messages []Message
	messages = append(messages, Message{Role: "system", Content: OracleSystemPrompt})

	for _, m := range contextMessages {
		messages = append(messages, m)
	}

	if userName != "" {
		messages = append(messages, Message{Role: "user", Content: fmt.Sprintf("%s says: %s", userName, message)})
	} else {
		messages = append(messages, Message{Role: "user", Content: message})
	}

	return c.Generate(ctx, messages)
}
