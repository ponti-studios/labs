package kuma

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewClient(t *testing.T) {
	client := NewClient("test-api-key", "test-model")

	assert.Equal(t, "test-api-key", client.apiKey)
	assert.Equal(t, "test-model", client.model)
	assert.Equal(t, "https://openrouter.ai/api/v1", client.baseURL)
	assert.NotNil(t, client.httpClient)
}

func TestClient_Generate(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "Bearer test-key", r.Header.Get("Authorization"))
		assert.Equal(t, "Kuma", r.Header.Get("X-Title"))

		var req Request
		body, _ := io.ReadAll(r.Body)
		err := json.Unmarshal(body, &req)
		require.NoError(t, err)

		assert.Len(t, req.Messages, 1)
		assert.Equal(t, "user", req.Messages[0].Role)
		assert.Equal(t, "Hello", req.Messages[0].Content)

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Hi there!"}},
			},
			Usage: Usage{
				PromptTokens:     10,
				CompletionTokens: 5,
				TotalTokens:      15,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:  "test-key",
		model:   "test-model",
		baseURL: server.URL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}

	result, err := client.Generate(context.Background(), []Message{
		{Role: "user", Content: "Hello"},
	})

	require.NoError(t, err)
	assert.Equal(t, "Hi there!", result)
}

func TestClient_GenerateWithSystemPrompt(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Len(t, req.Messages, 2)
		assert.Equal(t, "system", req.Messages[0].Role)
		assert.Equal(t, "You are helpful.", req.Messages[0].Content)
		assert.Equal(t, "user", req.Messages[1].Role)
		assert.Equal(t, "Hello", req.Messages[1].Content)

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Response"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateWithSystemPrompt(context.Background(), "You are helpful.", "Hello")
	require.NoError(t, err)
	assert.Equal(t, "Response", result)
}

func TestClient_Generate_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	_, err := client.Generate(context.Background(), []Message{{Role: "user", Content: "Hello"}})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "status 500")
}

func TestClient_Generate_EmptyChoices(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := Response{
			Choices: []Choice{},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	_, err := client.Generate(context.Background(), []Message{{Role: "user", Content: "Hello"}})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "no choices")
}

func TestClient_GenerateDream(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Contains(t, req.Messages[0].Content, "You are Kuma")
		assert.Contains(t, req.Messages[0].Content, "dream")

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Your dream means something!"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateDream(context.Background(), "flying tacos")
	require.NoError(t, err)
	assert.Equal(t, "Your dream means something!", result)
}

func TestClient_GenerateManifestation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Contains(t, req.Messages[0].Content, "You are Kuma")
		assert.Contains(t, req.Messages[0].Content, "manifest")

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "It shall be manifested!"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateManifestation(context.Background(), "a parking spot")
	require.NoError(t, err)
	assert.Equal(t, "It shall be manifested!", result)
}

func TestClient_GenerateFortune(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Contains(t, req.Messages[0].Content, "You are Kuma")
		assert.Contains(t, req.Messages[0].Content, "fortune")

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "A great fortune awaits!"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateFortune(context.Background())
	require.NoError(t, err)
	assert.Equal(t, "A great fortune awaits!", result)
}

func TestClient_GenerateGuidance(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Contains(t, req.Messages[0].Content, "You are Kuma")
		assert.Contains(t, req.Messages[0].Content, "guidance")

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Follow the stars."}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateGuidance(context.Background(), "should I move?")
	require.NoError(t, err)
	assert.Equal(t, "Follow the stars.", result)
}

func TestClient_GenerateGeneral(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Len(t, req.Messages, 3)
		assert.Equal(t, "system", req.Messages[0].Role)
		assert.Contains(t, req.Messages[0].Content, "You are Kuma")
		assert.Equal(t, "user", req.Messages[1].Role)
		assert.Equal(t, "previous", req.Messages[1].Content)
		assert.Equal(t, "user", req.Messages[2].Role)
		assert.Equal(t, "Charles says: hello", req.Messages[2].Content)

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Hello Charles!"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateGeneral(
		context.Background(),
		"hello",
		"Charles",
		[]Message{{Role: "user", Content: "previous"}},
	)
	require.NoError(t, err)
	assert.Equal(t, "Hello Charles!", result)
}

func TestClient_GenerateGeneral_NoHistory(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &req)

		assert.Len(t, req.Messages, 2)
		assert.Equal(t, "system", req.Messages[0].Role)
		assert.Equal(t, "user", req.Messages[1].Role)
		assert.Equal(t, "hello", req.Messages[1].Content)

		resp := Response{
			Choices: []Choice{
				{Message: Message{Role: "assistant", Content: "Hello!"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:     "test-key",
		model:      "test-model",
		baseURL:    server.URL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}

	result, err := client.GenerateGeneral(context.Background(), "hello", "", nil)
	require.NoError(t, err)
	assert.Equal(t, "Hello!", result)
}
