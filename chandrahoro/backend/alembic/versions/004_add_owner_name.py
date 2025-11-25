"""add owner name

Revision ID: 004_add_owner_name
Revises: 003_add_shared_keys
Create Date: 2025-10-30 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_owner_name'
down_revision = '003_add_shared_keys'
branch_labels = None
depends_on = None


def upgrade():
    # Add owner name columns to llm_configs table
    op.add_column('llm_configs', sa.Column('use_owner_name', sa.Boolean, default=False, nullable=False, server_default='0'))
    op.add_column('llm_configs', sa.Column('key_owner_name', sa.String(100), nullable=True, index=True))


def downgrade():
    # Remove owner name columns from llm_configs
    op.drop_column('llm_configs', 'key_owner_name')
    op.drop_column('llm_configs', 'use_owner_name')

