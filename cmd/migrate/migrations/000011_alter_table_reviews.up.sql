ALTER TABLE
  reviews
ADD
  CONSTRAINT fk_professor FOREIGN KEY (professor_id) REFERENCES professor(id) ON DELETE CASCADE;

ALTER TABLE
  reviews
ADD
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
