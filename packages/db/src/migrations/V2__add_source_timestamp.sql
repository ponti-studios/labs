-- add source and timestamp columns to disaster_events
ALTER TABLE disaster_events
ADD COLUMN source TEXT;

ALTER TABLE disaster_events
ADD COLUMN timestamp TEXT;
