# Development stage with Air hot-reload
FROM golang:1.24-alpine AS dev

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev

# Install Air for hot-reload (v1.61.7 supports Go 1.24)
RUN go install github.com/air-verse/air@v1.61.7

# Download dependencies first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy Air config
COPY .air.toml .

# Command runs Air which watches for changes and rebuilds
CMD ["air"]

# Production stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o kuma ./cmd/server

FROM alpine:3.21

# Explicitly upgrade OpenSSL to fix CVE-2025-15467, CVE-2025-69419, CVE-2025-69421
RUN apk update && \
    apk upgrade --no-cache libcrypto3 libssl3 && \
    apk add --no-cache ca-certificates wget

WORKDIR /app

COPY --from=builder /app/kuma .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
    CMD [ "/app/kuma", "--health-check" ]

ENTRYPOINT ["/app/kuma"]
