-- Spatial Extensions for MySQL 8.0+
-- Stored procedures and grants for spatial query helpers

USE labs;

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS verify_spatial_support()
BEGIN
  SELECT ST_Distance_Sphere(
    ST_GeomFromText('POINT(0 0)', 4326),
    ST_GeomFromText('POINT(1 1)', 4326)
  ) AS spatial_test;
END //

DELIMITER ;

-- Grant execute to the labs user
GRANT EXECUTE ON PROCEDURE labs.verify_spatial_support TO 'labs'@'%';
