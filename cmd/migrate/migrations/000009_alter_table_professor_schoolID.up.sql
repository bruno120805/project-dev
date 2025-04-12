ALTER TABLE
  professor
ADD
  COLUMN school_id bigserial REFERENCES school(id);