-- V2: Create Users and User Sessions tables
CREATE TABLE users (
    id                      BIGSERIAL PRIMARY KEY,

    -- Identity
    username                VARCHAR(50) UNIQUE NOT NULL,
    email                   VARCHAR(150) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,

    -- Profile
    full_name               VARCHAR(150),
    phone_number            VARCHAR(20),
    avatar_url              VARCHAR(500),

    -- Role & Access
    role                    VARCHAR(20) NOT NULL DEFAULT 'USER', -- USER | ADMIN
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | BLOCKED | DELETED

    -- Security
    email_verified          BOOLEAN DEFAULT FALSE,
    failed_login_attempts   INT DEFAULT 0,
    lock_expires_at         TIMESTAMP,
    last_login_at           TIMESTAMP,

    -- Audit
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Soft Delete
    deleted                 BOOLEAN DEFAULT FALSE,
    deleted_at              TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- User Sessions (multi-device refresh token management)
CREATE TABLE user_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL UNIQUE,
    device_info     VARCHAR(255),
    ip_address      VARCHAR(100),
    location        VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_is_active ON user_sessions(is_active);
