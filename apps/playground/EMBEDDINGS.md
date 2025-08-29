# Task Embeddings with Gemini

This application now supports automatic embedding generation for tasks using Google's Gemini AI. When tasks are created, their content is automatically converted to embeddings and stored in the database for semantic search capabilities.

## Features

- **Automatic Embedding Generation**: When a task is created, its title and project name are automatically converted to embeddings using Gemini's `gemini-embedding-001` model
- **Semantic Search**: Search for tasks using natural language queries that find semantically similar content
- **Fallback to Text Search**: If semantic search fails, the system automatically falls back to traditional text-based search
- **Similarity Scoring**: Results are ranked by semantic similarity when using semantic search

## Setup

### 1. Environment Variables

Add your Google API key to your environment variables:

```bash
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. Database Migration

The embeddings table is automatically created when you run:

```bash
npx drizzle-kit migrate
```

### 3. Test the Setup

Run the test script to verify your Google API key works:

```bash
GOOGLE_API_KEY=your_key npx tsx test-embeddings.ts
```

## Usage

### Creating Tasks with Embeddings

Tasks automatically generate embeddings when created. The embedding includes:
- Task title
- Project name (if assigned)

Example task creation:
```typescript
// This will automatically generate an embedding
const newTodo = await createTodo({
  title: "Review quarterly budget",
  projectId: 1,
  start: "2024-01-15",
  end: "2024-01-15",
  completed: false
}, userId);
```

### Semantic Search

Use semantic search by adding `?type=semantic` to your search query:

```
GET /api/search?query=budget planning&type=semantic
```

This will find tasks semantically related to "budget planning", even if they don't contain those exact words.

### Traditional Text Search

For exact text matching, use the default search:

```
GET /api/search?query=budget
```

## API Endpoints

### Search API

- **URL**: `/api/search`
- **Method**: `GET`
- **Parameters**:
  - `query` (required): Search term
  - `type` (optional): `"text"` or `"semantic"` (default: `"text"`)

### Response Format

```json
{
  "results": [
    {
      "post": {
        "id": "123",
        "content": "Review quarterly budget",
        "platform": "tasks",
        "date": "2024-01-15T00:00:00.000Z",
        "engagement": 0,
        "author": "Finance Project",
        "url": "/tasks/1",
        "tags": ["pending"]
      },
      "score": 0.95
    }
  ]
}
```

## Database Schema

The embeddings are stored in the `embeddings` table:

```sql
CREATE TABLE "embeddings" (
  "id" serial PRIMARY KEY NOT NULL,
  "todo_id" integer NOT NULL REFERENCES "todos"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "embedding" real[] NOT NULL,
  "model" text DEFAULT 'gemini-embedding-001' NOT NULL,
  "created_at" timestamp DEFAULT now()
);
```

## Error Handling

- If embedding generation fails, the task creation still succeeds
- If semantic search fails, the system automatically falls back to text search
- All errors are logged for debugging

## Performance Considerations

- Embeddings are generated asynchronously to avoid blocking task creation
- Semantic search includes similarity scoring for better result ranking
- The system uses cosine similarity for comparing embeddings
