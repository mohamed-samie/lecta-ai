import os
import sqlite3
from pathlib import Path

DB_PATH = Path("lecta_ai.db")


def column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(row[1] == column for row in rows)


def table_exists(conn: sqlite3.Connection, table: str) -> bool:
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table,),
    ).fetchone()
    return row is not None


def add_column_if_missing(conn: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    if table_exists(conn, table) and not column_exists(conn, table, column):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added {table}.{column}")
    else:
        print(f"[SKIP] {table}.{column}")


def create_index_if_missing(conn: sqlite3.Connection, index_name: str, sql: str) -> None:
    conn.execute(sql)
    print(f"[OK] Ensured index {index_name}")


def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit("lecta_ai.db not found. Run alembic upgrade head first.")

    conn = sqlite3.connect(DB_PATH)
    try:
        # jobs
        add_column_if_missing(conn, "jobs", "session_id", "session_id INTEGER")
        add_column_if_missing(
            conn,
            "jobs",
            "created_at",
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        )

        # study_sessions
        add_column_if_missing(
            conn,
            "study_sessions",
            "created_at",
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        )

        # uploaded_files
        add_column_if_missing(
            conn,
            "uploaded_files",
            "created_at",
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        )

        # generated_exams
        add_column_if_missing(
            conn,
            "generated_exams",
            "created_at",
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        )

        # exam_attempts
        add_column_if_missing(
            conn,
            "exam_attempts",
            "created_at",
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        )

        create_index_if_missing(
            conn,
            "ix_jobs_session_id",
            "CREATE INDEX IF NOT EXISTS ix_jobs_session_id ON jobs (session_id)",
        )

        conn.commit()
        print("[DONE] SQLite dev repair completed.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()