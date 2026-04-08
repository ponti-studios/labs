// Package whatsapp handles Meta WhatsApp Cloud API integration
package whatsapp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client communicates with Meta WhatsApp API
type Client struct {
	phoneNumberID string
	accessToken   string
	baseURL       string
	httpClient    *http.Client
}

// NewClient creates a new WhatsApp API client
func NewClient(phoneNumberID, accessToken string) *Client {
	return &Client{
		phoneNumberID: phoneNumberID,
		accessToken:   accessToken,
		baseURL:       "https://graph.facebook.com/v21.0",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Message represents an incoming WhatsApp message
type Message struct {
	From      string    // User's WhatsApp number (wa:id)
	To        string    // Our phone number ID
	Body      string    // Message text
	ID        string    // Message ID
	Type      string    // "text", "image", "audio", etc.
	Timestamp time.Time // When the message was sent
}

// ResponsePayload is what we send to WhatsApp
type ResponsePayload struct {
	MessagingProduct string       `json:"messaging_product"`
	To               string       `json:"to"`
	Type             string       `json:"type"`
	Text             *TextContent `json:"text,omitempty"`
}

// TextContent is the text message content
type TextContent struct {
	Body string `json:"body"`
}

// WebhookPayload represents the incoming webhook JSON
type WebhookPayload struct {
	Object string  `json:"object"`
	Entry  []Entry `json:"entry"`
}

// Entry contains webhook entries
type Entry struct {
	ID      string   `json:"id"`
	Time    int64    `json:"time"`
	Changes []Change `json:"changes"`
}

// Change contains the message data
type Change struct {
	Value Value  `json:"value"`
	Field string `json:"field"`
}

// Value contains the actual message
type Value struct {
	MessagingProduct string      `json:"messaging_product"`
	Metadata         Metadata    `json:"metadata"`
	Messages         []WAMessage `json:"messages"`
}

// Metadata contains phone info
type Metadata struct {
	DisplayPhoneNumber string `json:"display_phone_number"`
	PhoneNumberID      string `json:"phone_number_id"`
}

// WAMessage is a WhatsApp message
type WAMessage struct {
	From      string   `json:"from"`
	ID        string   `json:"id"`
	Timestamp string   `json:"timestamp"`
	Type      string   `json:"type"`
	Text      *TextMsg `json:"text,omitempty"`
}

// TextMsg is text content
type TextMsg struct {
	Body string `json:"body"`
}

// ParseWebhook parses the incoming webhook JSON
func ParseWebhook(body []byte) ([]Message, error) {
	var payload WebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, fmt.Errorf("failed to parse webhook: %w", err)
	}

	var messages []Message
	for _, entry := range payload.Entry {
		for _, change := range entry.Changes {
			for _, msg := range change.Value.Messages {
				msgBody := ""
				if msg.Text != nil {
					msgBody = msg.Text.Body
				}

				ts, _ := time.Parse("2006-01-02T15:04:05-0700", msg.Timestamp)

				messages = append(messages, Message{
					From:      ExtractPhoneNumber(msg.From),
					To:        change.Value.Metadata.PhoneNumberID,
					Body:      msgBody,
					ID:        msg.ID,
					Type:      msg.Type,
					Timestamp: ts,
				})
			}
		}
	}

	return messages, nil
}

// ParseWebhookFromRequest parses from an http.Request
func ParseWebhookFromRequest(r *http.Request) ([]Message, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read body: %w", err)
	}
	return ParseWebhook(body)
}

// VerifyWebhook verifies the webhook using the verify token
func VerifyWebhook(mode, token, challenge string, verifyToken string) (string, error) {
	if mode != "subscribe" {
		return "", fmt.Errorf("unknown mode: %s", mode)
	}
	if token != verifyToken {
		return "", fmt.Errorf("invalid token")
	}
	return challenge, nil
}

// SendTextMessage sends a text message via WhatsApp API
func (c *Client) SendTextMessage(ctx context.Context, to, text string) error {
	payload := ResponsePayload{
		MessagingProduct: "whatsapp",
		To:               to,
		Type:             "text",
		Text:             &TextContent{Body: text},
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	url := fmt.Sprintf("%s/%s/messages", c.baseURL, c.phoneNumberID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// ExtractPhoneNumber extracts a phone number from WhatsApp ID format
func ExtractPhoneNumber(waID string) string {
	// WhatsApp ID format is usually "1234567890" or may include "wa:1234567890"
	return strings.TrimPrefix(waID, "wa:")
}
