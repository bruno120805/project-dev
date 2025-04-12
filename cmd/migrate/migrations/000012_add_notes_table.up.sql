CREATE TABLE IF NOT EXISTS notes (
  id bigserial PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  files_URL TEXT,
  user_id bigserial REFERENCES users(id),
  professor_id bigserial REFERENCES professor(id),
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
)