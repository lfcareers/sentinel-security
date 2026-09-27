CREATE TABLE board_posts (
                             post_id UUID PRIMARY KEY,
                             author_user_id UUID NOT NULL
                                 REFERENCES sentinel_users(user_id),
                             title VARCHAR(160) NOT NULL,
                             body TEXT NOT NULL,
                             status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                             created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                             updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

                             CONSTRAINT ck_board_posts_status
                                 CHECK (status IN ('PENDING', 'PUBLISHED', 'REMOVED')),
                             CONSTRAINT ck_board_posts_title
                                 CHECK (length(trim(title)) > 0),
                             CONSTRAINT ck_board_posts_body
                                 CHECK (length(trim(body)) > 0 AND length(body) <= 10000)
);

CREATE INDEX idx_board_posts_author_created
    ON board_posts (author_user_id, created_at DESC);

CREATE INDEX idx_board_posts_status_created
    ON board_posts (status, created_at DESC);