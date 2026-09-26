CREATE TABLE sentinel_users (
                                user_id UUID PRIMARY KEY,
                                issuer VARCHAR(255) NOT NULL,
                                subject VARCHAR(255) NOT NULL,
                                display_name VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                last_sign_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                CONSTRAINT uq_sentinel_users_identity UNIQUE (issuer, subject)
);