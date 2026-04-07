CREATE TABLE relationship_people (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  owner_user_id VARCHAR(191) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  status ENUM('active', 'paused', 'ended', 'archived') NOT NULL DEFAULT 'active',
  current_stage ENUM('talking', 'dating', 'exclusive', 'committed', 'ended') NOT NULL DEFAULT 'talking',
  started_at DATETIME NULL,
  ended_at DATETIME NULL,
  headline VARCHAR(255) NULL,
  profile_summary TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_relationship_people_owner_status_updated (owner_user_id, status, updated_at),
  INDEX idx_relationship_people_owner_stage (owner_user_id, current_stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_stage_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  from_stage ENUM('talking', 'dating', 'exclusive', 'committed', 'ended') NULL,
  to_stage ENUM('talking', 'dating', 'exclusive', 'committed', 'ended') NOT NULL,
  effective_at DATETIME NOT NULL,
  created_by_user_id VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_stage_history_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_stage_history_person_effective (person_id, effective_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  owner_user_id VARCHAR(191) NOT NULL,
  event_type ENUM('date', 'call', 'gift', 'trip', 'conflict', 'repair', 'boundary', 'intimacy', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  occurred_at DATETIME NOT NULL,
  sentiment ENUM('very_negative', 'negative', 'neutral', 'positive', 'very_positive') NOT NULL,
  intensity TINYINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_events_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_events_person_occurred (person_id, occurred_at),
  INDEX idx_relationship_events_owner_occurred (owner_user_id, occurred_at),
  INDEX idx_relationship_events_person_type_occurred (person_id, event_type, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_notes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  owner_user_id VARCHAR(191) NOT NULL,
  title VARCHAR(255) NULL,
  body LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_notes_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_notes_person_created (person_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_checkins (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  owner_user_id VARCHAR(191) NOT NULL,
  mood_score TINYINT UNSIGNED NOT NULL,
  clarity_score TINYINT UNSIGNED NOT NULL,
  trust_score TINYINT UNSIGNED NOT NULL,
  compatibility_score TINYINT UNSIGNED NOT NULL,
  energy_score TINYINT UNSIGNED NOT NULL,
  notes TEXT NULL,
  recorded_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_checkins_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_checkins_person_recorded (person_id, recorded_at),
  INDEX idx_relationship_checkins_owner_recorded (owner_user_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_flags (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  owner_user_id VARCHAR(191) NOT NULL,
  flag_type ENUM('red', 'green') NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT NULL,
  source ENUM('manual', 'derived_from_event', 'friend_feedback') NOT NULL DEFAULT 'manual',
  severity TINYINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_flags_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_flags_person_created (person_id, created_at),
  INDEX idx_relationship_flags_person_type (person_id, flag_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_friend_invites (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  owner_user_id VARCHAR(191) NOT NULL,
  invite_token VARCHAR(255) NOT NULL,
  status ENUM('active', 'revoked', 'expired') NOT NULL DEFAULT 'active',
  expires_at DATETIME NULL,
  share_summary BOOLEAN NOT NULL DEFAULT TRUE,
  share_timeline BOOLEAN NOT NULL DEFAULT TRUE,
  share_flags BOOLEAN NOT NULL DEFAULT TRUE,
  share_checkins BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_friend_invites_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  UNIQUE KEY uq_relationship_friend_invites_token (invite_token),
  INDEX idx_relationship_friend_invites_person_status (person_id, status),
  INDEX idx_relationship_friend_invites_owner_status (owner_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_friend_votes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  invite_id CHAR(36) NOT NULL,
  person_id CHAR(36) NOT NULL,
  voter_name VARCHAR(255) NOT NULL,
  voter_contact_hint VARCHAR(255) NULL,
  vote ENUM('stay', 'dump', 'needs_context') NOT NULL,
  confidence_score TINYINT UNSIGNED NULL,
  commentary TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_friend_votes_invite
    FOREIGN KEY (invite_id) REFERENCES relationship_friend_invites(id) ON DELETE CASCADE,
  CONSTRAINT fk_relationship_friend_votes_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  INDEX idx_relationship_friend_votes_person_created (person_id, created_at),
  INDEX idx_relationship_friend_votes_invite_created (invite_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE relationship_metrics_daily (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_id CHAR(36) NOT NULL,
  metric_date DATE NOT NULL,
  health_score DECIMAL(5, 2) NOT NULL,
  friend_sentiment_score DECIMAL(5, 2) NULL,
  red_flag_count INT NOT NULL DEFAULT 0,
  green_flag_count INT NOT NULL DEFAULT 0,
  event_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_relationship_metrics_daily_person
    FOREIGN KEY (person_id) REFERENCES relationship_people(id) ON DELETE CASCADE,
  UNIQUE KEY uq_relationship_metrics_daily_person_date (person_id, metric_date),
  INDEX idx_relationship_metrics_daily_person_date (person_id, metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
