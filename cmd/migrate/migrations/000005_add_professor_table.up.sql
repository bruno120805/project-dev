CREATE TABLE IF NOT EXISTS professor (
  id bigserial PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL
)