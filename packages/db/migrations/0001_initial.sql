CREATE TABLE disaster_events (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  category_id VARCHAR(255) NOT NULL,
  category_title TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  geometry_type TEXT NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  closed_at TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX disaster_events_category_id_idx ON disaster_events (category_id);
CREATE INDEX disaster_events_occurred_at_idx ON disaster_events (occurred_at(50));
