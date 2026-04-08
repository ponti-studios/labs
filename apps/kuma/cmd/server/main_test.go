package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/charlesponti/kuma/internal/config"
	"github.com/charlesponti/kuma/internal/database"
	"github.com/charlesponti/kuma/internal/kuma"
	"github.com/charlesponti/kuma/internal/whatsapp"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestServer(t *testing.T) (*gin.Engine, *database.DB, *httptest.Server) {
	gin.SetMode(gin.TestMode)

	db, err := database.New(":memory:")
	require.NoError(t, err)

	cfg := &config.Config{
		Port:                       "8080",
		DBPath:                     ":memory:",
		WhatsAppPhoneNumberID:      "test-phone-id",
		WhatsAppAccessToken:        "test-token",
		WhatsAppWebhookVerifyToken: "test-verify-token",
		OpenRouterAPIKey:           "test-api-key",
		OpenRouterModel:            "test-model",
	}

	router := gin.New()
	router.Use(gin.Recovery())

	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "timestamp": 1234567890})
	})

	router.GET("/webhook", handleWebhookVerify(cfg))
	router.POST("/webhook", handleWhatsApp(db, whatsapp.NewClient(cfg.WhatsAppPhoneNumberID, cfg.WhatsAppAccessToken), cfg))

	router.GET("/admin/stats", handleAdminStats(db))

	testServer := httptest.NewServer(router)
	return router, db, testServer
}

func TestHealthEndpoint(t *testing.T) {
	_, db, server := setupTestServer(t)
	defer server.Close()
	defer db.Close()

	resp, err := http.Get(server.URL + "/health")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&body)
	require.NoError(t, err)

	assert.Equal(t, "healthy", body["status"])
}

func TestHealthEndpoint_DBError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(gin.Recovery())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "error": "database unavailable"})
	})

	server := httptest.NewServer(router)
	defer server.Close()

	resp, err := http.Get(server.URL + "/health")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusServiceUnavailable, resp.StatusCode)
}

func TestWebhookVerify_GET(t *testing.T) {
	cfg := &config.Config{
		WhatsAppWebhookVerifyToken: "test-verify-token",
	}

	router := gin.New()
	router.GET("/webhook", handleWebhookVerify(cfg))

	testServer := httptest.NewServer(router)
	defer testServer.Close()

	resp, err := http.Get(testServer.URL + "/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=test-challenge")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	respBody, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	assert.Equal(t, "test-challenge", string(respBody))
}

func TestWebhookVerify_GET_InvalidToken(t *testing.T) {
	cfg := &config.Config{
		WhatsAppWebhookVerifyToken: "test-verify-token",
	}

	router := gin.New()
	router.GET("/webhook", handleWebhookVerify(cfg))

	server := httptest.NewServer(router)
	defer server.Close()

	resp, err := http.Get(server.URL + "/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=test-challenge")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusForbidden, resp.StatusCode)
}

func TestWebhookVerify_GET_MissingParams(t *testing.T) {
	cfg := &config.Config{
		WhatsAppWebhookVerifyToken: "test-verify-token",
	}

	router := gin.New()
	router.GET("/webhook", handleWebhookVerify(cfg))

	server := httptest.NewServer(router)
	defer server.Close()

	resp, err := http.Get(server.URL + "/webhook")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusForbidden, resp.StatusCode)
}

func TestAdminStats_Empty(t *testing.T) {
	_, db, server := setupTestServer(t)
	defer server.Close()
	defer db.Close()

	resp, err := http.Get(server.URL + "/admin/stats")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&body)
	require.NoError(t, err)

	assert.Equal(t, float64(0), body["total_users"])
	assert.Equal(t, float64(0), body["total_messages"])
}

func TestAdminStats_WithData(t *testing.T) {
	_, db, server := setupTestServer(t)
	defer server.Close()

	ctx := context.Background()

	user1, _ := db.CreateUser(ctx, "+1111111111")
	user2, _ := db.CreateUser(ctx, "+2222222222")

	db.SaveMessage(ctx, user1.ID, "user", "Hello")
	db.SaveMessage(ctx, user1.ID, "assistant", "Hi")
	db.SaveMessage(ctx, user2.ID, "user", "Test")

	resp, err := http.Get(server.URL + "/admin/stats")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&body)
	require.NoError(t, err)

	assert.Equal(t, float64(2), body["total_users"])
	assert.Equal(t, float64(3), body["total_messages"])

	db.Close()
}

func TestWebhook_POST_InvalidBody(t *testing.T) {
	db, err := database.New(":memory:")
	require.NoError(t, err)
	defer db.Close()

	cfg := &config.Config{
		WhatsAppPhoneNumberID:      "test-id",
		WhatsAppAccessToken:        "test-token",
		WhatsAppWebhookVerifyToken: "test-verify-token",
		OpenRouterAPIKey:           "test-key",
		OpenRouterModel:            "test-model",
	}

	router := gin.New()
	router.POST("/webhook", handleWhatsApp(db, whatsapp.NewClient(cfg.WhatsAppPhoneNumberID, cfg.WhatsAppAccessToken), cfg))

	testServer := httptest.NewServer(router)
	defer testServer.Close()

	resp, err := http.Post(testServer.URL+"/webhook", "application/json", nil)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestWebhook_POST_EmptyMessages(t *testing.T) {
	db, err := database.New(":memory:")
	require.NoError(t, err)
	defer db.Close()

	cfg := &config.Config{
		WhatsAppPhoneNumberID:      "test-id",
		WhatsAppAccessToken:        "test-token",
		WhatsAppWebhookVerifyToken: "test-verify-token",
		OpenRouterAPIKey:           "test-key",
		OpenRouterModel:            "test-model",
	}

	router := gin.New()
	router.POST("/webhook", handleWhatsApp(db, whatsapp.NewClient(cfg.WhatsAppPhoneNumberID, cfg.WhatsAppAccessToken), cfg))

	testServer := httptest.NewServer(router)
	defer testServer.Close()

	resp, err := http.Post(testServer.URL+"/webhook", "application/json", nil)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestParseCommand_AllCommands(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"/dream test", "/dream test", "dream"},
		{"/manifest test", "/manifest test", "manifest"},
		{"/fortune", "/fortune", "fortune"},
		{"/guidance test", "/guidance test", "guidance"},
		{"/name John", "/name John", "name"},
		{"/signs", "/signs", "signs"},
		{"/nosigns", "/nosigns", "nosigns"},
		{"/help", "/help", "help"},
		{"hello", "hello", "general"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := kuma.ParseCommand(tt.input)
			assert.Equal(t, tt.expected, cmd.Type)
		})
	}
}
