"""add sample format fields to ai_prompt_configs

Revision ID: 006_add_sample_format
Revises: 005_add_ai_prompt_configs
Create Date: 2025-11-26 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '006_add_sample_format'
down_revision = ('005_add_ai_prompt_configs', '3130c5b24b3a')
branch_labels = None
depends_on = None


def upgrade():
    """Add sample format file upload fields to ai_prompt_configs table."""
    # Add new columns for sample format file upload
    op.add_column('ai_prompt_configs', 
        sa.Column('sample_format_filename', sa.String(length=255), nullable=True))
    op.add_column('ai_prompt_configs', 
        sa.Column('sample_format_path', sa.String(length=500), nullable=True))
    op.add_column('ai_prompt_configs', 
        sa.Column('sample_format_type', sa.String(length=50), nullable=True))
    op.add_column('ai_prompt_configs', 
        sa.Column('sample_format_uploaded_at', sa.DateTime(), nullable=True))


def downgrade():
    """Remove sample format file upload fields from ai_prompt_configs table."""
    op.drop_column('ai_prompt_configs', 'sample_format_uploaded_at')
    op.drop_column('ai_prompt_configs', 'sample_format_type')
    op.drop_column('ai_prompt_configs', 'sample_format_path')
    op.drop_column('ai_prompt_configs', 'sample_format_filename')

