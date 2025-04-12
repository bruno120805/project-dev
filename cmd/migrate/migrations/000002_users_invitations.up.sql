CREATE TABLE IF NOT EXISTS users_invitations (
  token bytea PRIMARY KEY,
  user_id bigint NOT NULL
)