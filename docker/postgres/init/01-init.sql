-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create the database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable)

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE rocco TO rocco;
GRANT ALL PRIVILEGES ON SCHEMA public TO rocco;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rocco;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rocco;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rocco;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rocco; 