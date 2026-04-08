// Package kuma provides command parsing and routing for Kuma
package kuma

import (
	"context"
	"fmt"
	"strings"
)

// Command represents a parsed user command
type Command struct {
	Type    string   // "dream", "manifest", "fortune", "guidance", "name", "signs", "nosigns", "help", "general"
	Args    []string // Arguments for the command
	RawText string   // Original text
}

// ParseCommand parses a message and extracts commands
func ParseCommand(text string) *Command {
	text = strings.TrimSpace(text)
	lower := strings.ToLower(text)

	// Check for commands
	if strings.HasPrefix(lower, "/dream ") {
		return &Command{
			Type:    "dream",
			Args:    []string{strings.TrimPrefix(text, "/dream ")},
			RawText: text,
		}
	}

	if strings.HasPrefix(lower, "/manifest ") || strings.HasPrefix(lower, "/manifesto ") {
		return &Command{
			Type:    "manifest",
			Args:    []string{strings.TrimPrefix(text, "/manifest ")},
			RawText: text,
		}
	}

	if lower == "/fortune" || lower == "/fortune " {
		return &Command{
			Type:    "fortune",
			Args:    []string{},
			RawText: text,
		}
	}

	if strings.HasPrefix(lower, "/guidance ") {
		return &Command{
			Type:    "guidance",
			Args:    []string{strings.TrimPrefix(text, "/guidance ")},
			RawText: text,
		}
	}

	if strings.HasPrefix(lower, "/name ") {
		return &Command{
			Type:    "name",
			Args:    []string{strings.TrimPrefix(text, "/name ")},
			RawText: text,
		}
	}

	if lower == "/signs" || lower == "/signs " {
		return &Command{
			Type:    "signs",
			Args:    []string{},
			RawText: text,
		}
	}

	if lower == "/nosigns" || lower == "/nosigns " {
		return &Command{
			Type:    "nosigns",
			Args:    []string{},
			RawText: text,
		}
	}

	if lower == "/help" || lower == "/help " {
		return &Command{
			Type:    "help",
			Args:    []string{},
			RawText: text,
		}
	}

	// No command detected - general message
	return &Command{
		Type:    "general",
		Args:    []string{text},
		RawText: text,
	}
}

// ClientInterface defines the interface for AI client operations
type ClientInterface interface {
	Generate(ctx context.Context, messages []Message) (string, error)
	GenerateDream(ctx context.Context, dream string) (string, error)
	GenerateManifestation(ctx context.Context, desire string) (string, error)
	GenerateFortune(ctx context.Context) (string, error)
	GenerateGuidance(ctx context.Context, question string) (string, error)
	GenerateGeneral(ctx context.Context, text, userName string, history []Message) (string, error)
}

// HandleCommand processes a command and returns an AI response
func HandleCommand(ctx context.Context, client ClientInterface, cmd *Command, userName string, history []Message) (string, error) {
	switch cmd.Type {
	case "dream":
		if len(cmd.Args) == 0 {
			return "The cosmos awaits your dream. Tell me: /dream I was flying over a taco", nil
		}
		return client.GenerateDream(ctx, cmd.Args[0])

	case "manifest":
		if len(cmd.Args) == 0 {
			return "The universe listens. Declare your desire: /manifest a parking spot", nil
		}
		return client.GenerateManifestation(ctx, cmd.Args[0])

	case "fortune":
		return client.GenerateFortune(ctx)

	case "guidance":
		if len(cmd.Args) == 0 {
			return "The cosmos ponders your silence. Ask something: /guidance should I move to silver lake", nil
		}
		return client.GenerateGuidance(ctx, cmd.Args[0])

	case "name":
		// This is handled by the database layer
		return "", fmt.Errorf("name_command")

	case "signs":
		// This is handled by the database layer
		return "", fmt.Errorf("signs_command")

	case "nosigns":
		// This is handled by the database layer
		return "", fmt.Errorf("nosigns_command")

	case "help":
		return HelpText, nil

	case "general":
		return client.GenerateGeneral(ctx, cmd.RawText, userName, history)

	default:
		return "The cosmos does not understand. Try /help", nil
	}
}

// HelpText is the help message displayed to users
const HelpText = `✨ KUMA COMMANDS ✨

/dream <description> - Interpret your dreams
/manifest <desire> - Manifest your desires
/fortune - Receive a cosmic fortune
/guidance <question> - Ask for guidance
/name <your name> - Tell Kuma your name
/signs - Enable daily cosmic signs
/nosigns - Disable daily cosmic signs
/help - Show this message

The cosmos awaits your query.`

// GetNameFromCommand extracts the name from a /name command
func GetNameFromCommand(cmd *Command) string {
	if cmd.Type != "name" || len(cmd.Args) == 0 {
		return ""
	}
	return strings.TrimSpace(cmd.Args[0])
}
