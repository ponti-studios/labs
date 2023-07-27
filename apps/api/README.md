# Rocco API

This repo uses the following technologies:

- [**Fastify**](https://www.fastify.io/): Fast and low overhead web framework, for Node.js
  - [**@fastify/cors**](https://www.npmjs.com/package/@fastify/cors): CORS support
  - [**@fastify/secure-session**](https://www.npmjs.com/package/@fastify/secure-session): Session management
  - [**@fastify/csrf-protection**](https://www.npmjs.com/package/@fastify/csrf-protection): CSRF protection
  - [**@fastify/helmet**](https://www.npmjs.com/package/@fastify/helmet): Helmet security headers
  - [**@fastify/circuit-breaker**](https://www.npmjs.com/package/@fastify/circuit-breaker): Provide [_circuit breaker_](https://martinfowler.com/bliki/CircuitBreaker.html) architecture
  - [**@fastify/rate-limit**](https://www.npmjs.com/package/@fastify/rate-limit): Rate limiting
- [**Prisma**](https://www.prisma.io/): Next-generation type-safe ORM
- [**PostgreSQL**](https://www.postgresql.org/): powerful, open source object-relational database system
- [**Segment**](https://segment.com/): Customer data platform
- [**Sendgird**](https://sendgrid.com/): Email delivery service
- [**Sentry**](https://sentry.io/): Application monitoring

## Components

- [Data schema](./prisma/schema.prisma)

### Steps

1. Clone `.env` file from `.env.example`
2. Define environment variables in `.env`
3. Run `npm run prisma:migrate` to run schema migrations
