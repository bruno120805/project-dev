CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  professor_id bigserial NOT NULL,
  user_id bigserial NOT NULL,
  subject VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (
    difficulty BETWEEN 1
    AND 10
  ),
  created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
);
