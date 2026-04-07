CREATE TABLE playground_tfl_cameras (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tfl_id VARCHAR(255) NOT NULL,
  common_name VARCHAR(255) NOT NULL,
  available TINYINT UNSIGNED NULL DEFAULT 1,
  image_url TEXT NULL,
  video_url TEXT NULL,
  view TEXT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_playground_tfl_cameras_tfl_id (tfl_id),
  INDEX idx_playground_tfl_cameras_available (available),
  INDEX idx_playground_tfl_cameras_location (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;