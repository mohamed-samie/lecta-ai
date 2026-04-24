ALTER TABLE jobs ADD COLUMN session_id INTEGER;
CREATE INDEX IF NOT EXISTS ix_jobs_session_id ON jobs (session_id);