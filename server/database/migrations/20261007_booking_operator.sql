-- Apply once to an existing Agriiigo database before starting the updated app.
ALTER TABLE bookings
  ADD COLUMN operator_type ENUM('OWNER','DRIVER') NOT NULL DEFAULT 'OWNER' AFTER base_price,
  ADD COLUMN driver_name VARCHAR(120) NULL AFTER operator_type,
  ADD COLUMN driver_phone VARCHAR(24) NULL AFTER driver_name;
