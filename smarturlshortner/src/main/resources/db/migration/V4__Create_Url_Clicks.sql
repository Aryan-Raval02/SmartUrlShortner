-- V4: Create URL Clicks table for analytics
CREATE TABLE url_clicks (
    id              BIGSERIAL PRIMARY KEY,
    url_id          BIGINT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,

    ip_address      VARCHAR(100),
    browser         VARCHAR(100),
    os              VARCHAR(100),
    device_type     VARCHAR(50),    -- Desktop | Mobile | Tablet

    referrer        TEXT,
    country         VARCHAR(100),
    city            VARCHAR(100),

    clicked_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_url_clicks_url_id ON url_clicks(url_id);
CREATE INDEX idx_url_clicks_clicked_at ON url_clicks(clicked_at);
CREATE INDEX idx_url_clicks_ip ON url_clicks(ip_address);
