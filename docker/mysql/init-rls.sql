-- Row-Level Security Helpers for MySQL
-- Procedures and functions that emulate RLS-style user scoping using session variables.
-- The application must call set_current_user(userId) after authenticating a connection.

USE labs;

-- Clean up any existing definitions first
DROP PROCEDURE IF EXISTS set_current_user;
DROP FUNCTION IF EXISTS current_user_id;
DROP PROCEDURE IF EXISTS clear_current_user;

DELIMITER //

CREATE PROCEDURE set_current_user(IN p_user_id VARCHAR(255))
BEGIN
  SET @rls_current_user_id = p_user_id;
END //

CREATE FUNCTION current_user_id() RETURNS VARCHAR(255)
DETERMINISTIC
READS SQL DATA
BEGIN
  RETURN @rls_current_user_id;
END //

CREATE PROCEDURE clear_current_user()
BEGIN
  SET @rls_current_user_id = NULL;
END //

DELIMITER ;

-- Grant execute to the labs user
GRANT EXECUTE ON PROCEDURE labs.set_current_user TO 'labs'@'%';
GRANT EXECUTE ON PROCEDURE labs.clear_current_user TO 'labs'@'%';
GRANT EXECUTE ON FUNCTION labs.current_user_id TO 'labs'@'%';
