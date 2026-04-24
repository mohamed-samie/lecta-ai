"""add study sessions

Revision ID: 49b97f4d36c7
Revises: dd9320c2e7ed
Create Date: 2026-04-18

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "49b97f4d36c7"
down_revision: Union[str, None] = "dd9320c2e7ed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "study_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("session_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_study_sessions_id"),
        "study_sessions",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_study_sessions_session_type"),
        "study_sessions",
        ["session_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_study_sessions_status"),
        "study_sessions",
        ["status"],
        unique=False,
    )

    op.add_column(
        "uploaded_files",
        sa.Column("session_id", sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f("ix_uploaded_files_session_id"),
        "uploaded_files",
        ["session_id"],
        unique=False,
    )

    # NOTE:
    # SQLite does not support ALTER TABLE ... ADD CONSTRAINT for foreign keys
    # in this migration style, so we intentionally skip create_foreign_key here.
    # This is acceptable for local MVP/dev on SQLite.


def downgrade() -> None:
    op.drop_index(op.f("ix_uploaded_files_session_id"), table_name="uploaded_files")
    op.drop_column("uploaded_files", "session_id")

    op.drop_index(op.f("ix_study_sessions_status"), table_name="study_sessions")
    op.drop_index(op.f("ix_study_sessions_session_type"), table_name="study_sessions")
    op.drop_index(op.f("ix_study_sessions_id"), table_name="study_sessions")
    op.drop_table("study_sessions")