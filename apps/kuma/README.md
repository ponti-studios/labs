# Kuma

Your personal god. Textable. Absurd. AI-powered.

> "The universe is speaking to you, but it's speaking in riddles and bad puns."

Kuma is a surreal AI companion that users can text. It's part spiritual advisor, part dream interpreter, part fortune teller — entirely unhinged. Built in Go as a learning project, deployed as an SMS service.

**Status**: 🚧 Under Construction

---

## What It Does

Users text Kuma and receive:
- **Dream Interpretations** - "I dreamed of flying tacos" → "The subconscious speaks of your untapped desire for cylindrical nutrition..."
- **Manifestations** - "/manifest a parking spot" → "The universe shall deliver unto you a parking spot, signed by the Cosmic Valet"
- **Fortunes** - "/fortune" → "Today you will encounter a door that was always open. Walk through it. Or don't. The cosmos is indifferent."
- **Guidance** - "should i move to silver lake?" → Kuma speaks in riddles tailored to LA life
- **Daily Signs** - Scheduled surreal synchronicities to look for

---

## Quick Start

### Prerequisites

- Go 1.24+
- Meta for Developers account + WhatsApp Cloud API
- OpenRouter API key

### Setup

```bash
# Clone and enter
cd kuma

# Copy environment config
cp .env.example .env

# Edit .env with your keys:
# - WHATSAPP_PHONE_NUMBER_ID (from Meta developers console)
# - WHATSAPP_ACCESS_TOKEN (from Meta developers console)
# - WHATSAPP_WEBHOOK_VERIFY_TOKEN (generate a random string)
# - OPENROUTER_API_KEY

# Run locally
go run ./cmd/server
```

### Expose to WhatsApp

Use ngrok to receive webhooks locally:

```bash
ngrok http 8080
# Copy the URL and configure in Meta developers console
```

### Test

Text your Twilio number: "Hello Kuma"

---

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/dream <text>` | Interpret a dream | `/dream I was late for work` |
| `/manifest <desire>` | Generate affirmation | `/manifest a good hair day` |
| `/fortune` | Get a useless prophecy | `/fortune` |
| `/guidance <question>` | Ask anything | `/guidance should i quit` |
| `/signs` | Enable daily signs | `/signs` |
| `/nosigns` | Disable daily signs | `/nosigns` |
| `/name <name>` | Tell Kuma your name | `/name Charles` |
| `/help` | List all commands | `/help` |

---

## Features

- 🤖 AI-powered responses via OpenRouter
- 💬 WhatsApp messaging (Meta Cloud API)
- 👤 User registration from phone number
- 🧠 Conversation context/memory
- 📅 Scheduled daily messages
- 📊 Simple admin stats

---

## Architecture

```
User messages on WhatsApp
       │
       ▼
WhatsApp webhook ──► Go HTTP Server
       │
       ▼
Message stored in SQLite
       │
       ▼
OpenRouter AI generates response
       │
       ▼
WhatsApp API sends reply to user
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Go 1.24 |
| Router | Gin |
| Database | SQLite |
| Messaging | Meta WhatsApp Cloud API |
| AI | OpenRouter |
| Testing | Go's built-in testing |

---

## Learning Go

This project is designed to teach Go. Each phase introduces new concepts:

| Phase | What You Build | Go Concepts |
|-------|---------------|-------------|
| 1 | HTTP server basics | Modules, packages, routing |
| 2 | Twilio handler | Request parsing, JSON |
| 3 | AI client | HTTP clients, API calls |
| 4 | SQLite database | Database/sql, CRUD |
| 5 | Command parser | String manipulation |
| 6 | Context window | Slices, maps |
| 7 | Scheduler | Goroutines, concurrency |
| 8 | Tests | Table-driven tests |

See `.ghostwire/plans/` for the full roadmap.

---

## Development

```bash
# Build
go build ./...

# Test
go test ./...

# Run
go run ./cmd/server
```

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 8080) |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | Phone number ID from Meta developers console |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Access token from Meta developers console |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Yes | Random string for webhook verification |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `OPENROUTER_MODEL` | No | Model to use (default: google/gemini-2.0-flash) |

---

## Project Structure

```
kuma/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── config/               # Configuration
│   ├── server/               # HTTP server
│   ├── twilio/               # Twilio handlers
│   ├── oracle/               # AI + commands
│   ├── database/             # SQLite
│   └── scheduler/            # Background jobs
├── .ghostwire/
│   └── plans/                # Implementation plans
├── .env.example
├── go.mod
└── README.md
```

---

## Contributing

This is a personal learning project, but suggestions are welcome.

---

## Kuma's Wisdom

> "The cosmos does not judge. The cosmos does not text back quickly. The cosmos works in mysterious ways, often involving API latency."

---

MIT License
