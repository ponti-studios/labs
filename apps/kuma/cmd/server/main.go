// Package main provides the Kuma server entry point
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/charlesponti/kuma/internal/config"
	"github.com/charlesponti/kuma/internal/database"
	"github.com/charlesponti/kuma/internal/kuma"
	"github.com/charlesponti/kuma/internal/whatsapp"
	"github.com/gin-gonic/gin"
)

func main() {
	port := flag.String("port", "8080", "Port to listen on")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	if *port != "" {
		cfg.Port = *port
	}

	// Initialize database
	db, err := database.New(cfg.DBPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()
	log.Println("Connected to database")

	// Initialize WhatsApp client
	waClient := whatsapp.NewClient(cfg.WhatsAppPhoneNumberID, cfg.WhatsAppAccessToken)
	log.Println("Connected to WhatsApp API")

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "timestamp": time.Now().Unix()})
	})

	// WhatsApp webhook endpoints
	router.GET("/webhook", handleWebhookVerify(cfg))
	router.POST("/webhook", handleWhatsApp(db, waClient, cfg))

	// Admin stats endpoint
	router.GET("/admin/stats", handleAdminStats(db))

	// Create server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("✨ Kuma listening on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down Kuma...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✨ Kuma has departed")
}

// handleWebhookVerify handles the WhatsApp webhook verification
func handleWebhookVerify(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		mode := c.Query("hub.mode")
		token := c.Query("hub.verify_token")
		challenge := c.Query("hub.challenge")

		result, err := whatsapp.VerifyWebhook(mode, token, challenge, cfg.WhatsAppWebhookVerifyToken)
		if err != nil {
			log.Printf("Webhook verification failed: %v", err)
			c.Status(http.StatusForbidden)
			return
		}

		c.String(http.StatusOK, result)
	}
}

// handleWhatsApp processes incoming WhatsApp messages
func handleWhatsApp(db *database.DB, waClient *whatsapp.Client, cfg *config.Config) gin.HandlerFunc {
	aiClient := kuma.NewClient(cfg.OpenRouterAPIKey, cfg.OpenRouterModel)
	return func(c *gin.Context) {
		messages, err := whatsapp.ParseWebhookFromRequest(c.Request)
		if err != nil {
			log.Printf("Failed to parse WhatsApp webhook: %v", err)
			c.Status(http.StatusBadRequest)
			return
		}

		if len(messages) == 0 {
			c.Status(http.StatusOK)
			return
		}

		ctx := context.Background()

		for _, msg := range messages {
			log.Printf("Received WhatsApp message from %s: %s", msg.From, msg.Body)

			// Get or create user
			user, err := db.GetUserByPhoneNumber(ctx, msg.From)
			if err != nil {
				log.Printf("Failed to get user: %v", err)
				continue
			}

			if user == nil {
				user, err = db.CreateUser(ctx, msg.From)
				if err != nil {
					log.Printf("Failed to create user: %v", err)
					continue
				}
				log.Printf("Created new user: %s", msg.From)
			}

			// Save user message
			_, err = db.SaveMessage(ctx, user.ID, "user", msg.Body)
			if err != nil {
				log.Printf("Failed to save user message: %v", err)
			}

			// Parse command
			cmd := kuma.ParseCommand(msg.Body)

			var response string

			// Handle special commands that need database access
			switch cmd.Type {
			case "name":
				name := kuma.GetNameFromCommand(cmd)
				if name != "" {
					err := db.UpdateUserName(ctx, user.ID, name)
					if err != nil {
						log.Printf("Failed to update name: %v", err)
					}
					response = fmt.Sprintf("The cosmos now knows you as %s. Welcome, seeker.", name)
				} else {
					response = "Tell Kuma your name: /name YourName"
				}

			case "signs":
				err := db.ToggleDailySigns(ctx, user.ID, true)
				if err != nil {
					log.Printf("Failed to enable signs: %v", err)
				}
				response = "✨ Daily cosmic signs enabled. The universe shall send you signs."

			case "nosigns":
				err := db.ToggleDailySigns(ctx, user.ID, false)
				if err != nil {
					log.Printf("Failed to disable signs: %v", err)
				}
				response = "Daily cosmic signs disabled. The cosmos will respect your privacy."

			default:
				// Get conversation history for context
				history, err := db.GetConversationHistory(ctx, user.ID, 10)
				if err != nil {
					log.Printf("Failed to get history: %v", err)
				}

				// Convert history to oracle messages
				var oracleHistory []kuma.Message
				for _, m := range history {
					oracleHistory = append(oracleHistory, kuma.Message{
						Role:    m.Role,
						Content: m.Content,
					})
				}

				// Get user name
				var userName string
				if user.Name != nil {
					userName = *user.Name
				}

				// Handle command
				response, err = kuma.HandleCommand(ctx, aiClient, cmd, userName, oracleHistory)
				if err != nil {
					if err.Error() == "name_command" || err.Error() == "signs_command" || err.Error() == "nosigns_command" {
						response, _ = kuma.HandleCommand(ctx, aiClient, cmd, userName, oracleHistory)
					} else {
						log.Printf("AI error: %v", err)
						response = "The cosmos is pondering your query. Try again."
					}
				}
			}

			// Save oracle response
			_, err = db.SaveMessage(ctx, user.ID, "oracle", response)
			if err != nil {
				log.Printf("Failed to save oracle message: %v", err)
			}

			log.Printf("Sending response to %s: %s", msg.From, response)

			// Send response via WhatsApp
			err = waClient.SendTextMessage(ctx, msg.From, response)
			if err != nil {
				log.Printf("Failed to send WhatsApp message: %v", err)
			}
		}

		c.Status(http.StatusOK)
	}
}

func handleAdminStats(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		stats, err := db.GetStats(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total_users":      stats.TotalUsers,
			"total_messages":   stats.TotalMessages,
			"messages_today":   stats.MessagesToday,
			"active_users_7d":  stats.ActiveUsers,
			"users_with_signs": stats.UsersWithSigns,
		})
	}
}
