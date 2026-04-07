CREATE TABLE playground_todos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  project_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  start VARCHAR(255) NOT NULL,
  end VARCHAR(255) NOT NULL,
  completed TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_playground_todos_project
    FOREIGN KEY (project_id) REFERENCES playground_projects(id) ON DELETE SET NULL,
  INDEX idx_playground_todos_user_id (user_id),
  INDEX idx_playground_todos_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;