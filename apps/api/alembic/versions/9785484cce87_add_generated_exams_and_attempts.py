"""add generated exams and attempts

Revision ID: 9785484cce87
Revises: 49b97f4d36c7
Create Date: 2026-04-18 03:51:29.843770

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9785484cce87'
down_revision: Union[str, Sequence[str], None] = '49b97f4d36c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'generated_exams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('exam_json', sa.Text(), nullable=False),
        sa.Column('question_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_generated_exams_id'), 'generated_exams', ['id'], unique=False)
    op.create_index(op.f('ix_generated_exams_session_id'), 'generated_exams', ['session_id'], unique=False)

    op.create_table(
        'exam_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('generated_exam_id', sa.Integer(), nullable=False),
        sa.Column('submission_json', sa.Text(), nullable=False),
        sa.Column('grading_json', sa.Text(), nullable=False),
        sa.Column('feedback_json', sa.Text(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('accuracy', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['generated_exam_id'], ['generated_exams.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exam_attempts_generated_exam_id'), 'exam_attempts', ['generated_exam_id'], unique=False)
    op.create_index(op.f('ix_exam_attempts_id'), 'exam_attempts', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_exam_attempts_id'), table_name='exam_attempts')
    op.drop_index(op.f('ix_exam_attempts_generated_exam_id'), table_name='exam_attempts')
    op.drop_table('exam_attempts')

    op.drop_index(op.f('ix_generated_exams_session_id'), table_name='generated_exams')
    op.drop_index(op.f('ix_generated_exams_id'), table_name='generated_exams')
    op.drop_table('generated_exams')