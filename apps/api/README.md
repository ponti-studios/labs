# Rocco API

This repo uses the following technologies:

- [**Fastify**](https://www.fastify.io/): Fast and low overhead web framework, for Node.js
  - [**@fastify/secure-session**](https://www.npmjs.com/package/@fastify/secure-session): Session management
  - [**fastify-csrf**](https://github.com/fastify/fastify-csrf): Protect against CSRF attacks
  - [**@fastify/circuit-breaker**](https://www.npmjs.com/package/@fastify/circuit-breaker): Provide [_circuit breaker_](https://martinfowler.com/bliki/CircuitBreaker.html) architecture
- [**Prisma**](https://www.prisma.io/): Next-generation type-safe ORM
- [**PostgreSQL**](https://www.postgresql.org/): powerful, open source object-relational database system
- [**Segment**](https://segment.com/): Customer data platform

## Components

- [Data schema](./prisma/schema.prisma)

### Steps

1. create `.env` file from `.env.example`
2. Define environment variables in `.env`
3. Run `pnpm prisma:dev` to run schema migrations
