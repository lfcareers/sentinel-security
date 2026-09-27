ALTER TABLE sentinel_users
    ADD COLUMN board_display_name VARCHAR(80),
    ADD COLUMN email_notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE;