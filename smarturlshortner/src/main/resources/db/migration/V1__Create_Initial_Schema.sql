-- V1: Create Initial Schema for URLs
CREATE TABLE urls (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT, -- NULL for guest

    original_url    TEXT NOT NULL,
    short_code      VARCHAR(50) UNIQUE NOT NULL,
    title           VARCHAR(150),

    active          BOOLEAN DEFAULT TRUE,
    deleted         BOOLEAN DEFAULT FALSE,
    expiry_date     TIMESTAMP,
    password_hash   VARCHAR(255),           -- optional link password

    total_clicks    BIGINT DEFAULT 0,
    unique_clicks   BIGINT DEFAULT 0,

    -- Flags
    suspicious      BOOLEAN DEFAULT FALSE,
    suspicious_reason VARCHAR(255),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_url_user_id ON urls(user_id);
CREATE INDEX idx_url_expiry_date ON urls(expiry_date);
CREATE INDEX idx_url_active ON urls(active);
