-- RLS Helper Functions for MCP Server
-- Run this script after migrations to create the required functions
-- These functions cannot be created via goose due to dollar-quote issues

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
DECLARE
    ctx RECORD;
BEGIN
    FOR ctx IN SELECT * FROM mcp_user_context ORDER BY created_at DESC LIMIT 1 LOOP
        RETURN ctx.user_id;
    END LOOP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set user context
CREATE OR REPLACE FUNCTION set_mcp_user_context(user_uuid UUID) RETURNS void AS $$
BEGIN
    INSERT INTO mcp_user_context (user_id) VALUES (user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user context
CREATE OR REPLACE FUNCTION get_mcp_user_context() RETURNS UUID AS $$
BEGIN
    RETURN current_user_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'RLS functions created successfully' AS status;
