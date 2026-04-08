// Package config provides simple, env-based configuration
package config

import (
	"fmt"
	"os"
)

// Config holds all application configuration
type Config struct {
	// Server
	Port        string `env:"PORT" envDefault:"8080"`
	LogLevel    string `env:"LOG_LEVEL" envDefault:"info"`
	Environment string `env:"ENVIRONMENT" envDefault:"development"`

	// Database
	DatabaseURL string `env:"DATABASE_URL"`
	DBPath      string `env:"DB_PATH" envDefault:"./oracle.db"`

	// Meta WhatsApp Cloud API
	WhatsAppPhoneNumberID      string `env:"WHATSAPP_PHONE_NUMBER_ID"`
	WhatsAppAccessToken        string `env:"WHATSAPP_ACCESS_TOKEN"`
	WhatsAppBusinessAccountID  string `env:"WHATSAPP_BUSINESS_ACCOUNT_ID"`
	WhatsAppWebhookVerifyToken string `env:"WHATSAPP_WEBHOOK_VERIFY_TOKEN"`

	// OpenRouter
	OpenRouterAPIKey string `env:"OPENROUTER_API_KEY"`
	OpenRouterModel  string `env:"OPENROUTER_MODEL" envDefault:"google/gemini-2.0-flash"`
}

// Load creates a Config from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		Port:                       getEnv("PORT", "8080"),
		LogLevel:                   getEnv("LOG_LEVEL", "info"),
		Environment:                getEnv("ENVIRONMENT", "development"),
		DatabaseURL:                os.Getenv("DATABASE_URL"),
		DBPath:                     getEnv("DB_PATH", "./oracle.db"),
		WhatsAppPhoneNumberID:      os.Getenv("WHATSAPP_PHONE_NUMBER_ID"),
		WhatsAppAccessToken:        os.Getenv("WHATSAPP_ACCESS_TOKEN"),
		WhatsAppBusinessAccountID:  os.Getenv("WHATSAPP_BUSINESS_ACCOUNT_ID"),
		WhatsAppWebhookVerifyToken: os.Getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN"),
		OpenRouterAPIKey:           os.Getenv("OPENROUTER_API_KEY"),
		OpenRouterModel:            getEnv("OPENROUTER_MODEL", "google/gemini-2.0-flash"),
	}

	// Validate required fields
	if cfg.WhatsAppPhoneNumberID == "" {
		return nil, fmt.Errorf("WHATSAPP_PHONE_NUMBER_ID is required")
	}
	if cfg.WhatsAppAccessToken == "" {
		return nil, fmt.Errorf("WHATSAPP_ACCESS_TOKEN is required")
	}
	if cfg.WhatsAppWebhookVerifyToken == "" {
		return nil, fmt.Errorf("WHATSAPP_WEBHOOK_VERIFY_TOKEN is required")
	}
	if cfg.OpenRouterAPIKey == "" {
		return nil, fmt.Errorf("OPENROUTER_API_KEY is required")
	}

	return cfg, nil
}

// getEnv returns the environment variable value or default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
