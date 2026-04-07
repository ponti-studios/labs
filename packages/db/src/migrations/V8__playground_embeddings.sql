CREATE TABLE playground_embeddings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  todo_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  embedding JSON NOT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'gemini-embedding-001',
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_playground_embeddings_todo
    FOREIGN KEY (todo_id) REFERENCES playground_todos(id) ON DELETE CASCADE,
  INDEX idx_playground_embeddings_todo_id (todo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;