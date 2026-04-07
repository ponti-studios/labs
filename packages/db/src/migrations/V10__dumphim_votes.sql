CREATE TABLE dumphim_votes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  tracker_id CHAR(36) NOT NULL,
  user_id VARCHAR(191) NULL,
  fingerprint VARCHAR(255) NOT NULL,
  rater_name VARCHAR(255) NOT NULL,
  value ENUM('stay', 'dump') NOT NULL,
  comment TEXT NULL,
  CONSTRAINT fk_dumphim_votes_tracker
    FOREIGN KEY (tracker_id) REFERENCES dumphim_trackers(id) ON DELETE CASCADE,
  INDEX idx_dumphim_votes_tracker_created (tracker_id, created_at),
  INDEX idx_dumphim_votes_tracker_value (tracker_id, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
