CREATE TABLE security_alerts (
                                 alert_id UUID PRIMARY KEY,
                                 source_event_id UUID NOT NULL,
                                 rule_id VARCHAR(128) NOT NULL,
                                 title VARCHAR(255) NOT NULL,
                                 description VARCHAR(255) NOT NULL,
                                 risk_score SMALLINT NOT NULL,
                                 severity VARCHAR(32) NOT NULL,
                                 host_id VARCHAR(255) NOT NULL,
                                 process_id BIGINT,
                                 action VARCHAR(32) NOT NULL,
                                 created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_security_alerts_created_at
    ON security_alerts (created_at DESC);

CREATE INDEX idx_security_alerts_host_created_at
    ON security_alerts (host_id, created_at DESC);