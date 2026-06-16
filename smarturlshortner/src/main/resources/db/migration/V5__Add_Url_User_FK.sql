-- V5: Add FK constraint from urls.user_id → users.id
ALTER TABLE urls
    ADD CONSTRAINT fk_urls_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
