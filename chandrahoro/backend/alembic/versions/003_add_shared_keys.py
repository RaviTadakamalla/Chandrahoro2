"""add shared keys

Revision ID: 003_add_shared_keys
Revises: 245870892701
Create Date: 2025-10-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '003_add_shared_keys'
down_revision = '245870892701'
branch_labels = None
depends_on = None


def upgrade():
    # Create llm_shared_keys table
    op.create_table(
        'llm_shared_keys',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('account_name', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('display_name', sa.String(200), nullable=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('owner_user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('is_public', sa.Boolean, default=False, nullable=False),
        sa.Column('allowed_user_ids', sa.JSON, nullable=True),
        sa.Column('provider', sa.Enum('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom', name='llmprovider'), nullable=False),
        sa.Column('model', sa.String(100), nullable=False),
        sa.Column('base_url', sa.String(500), nullable=True),
        sa.Column('region', sa.String(50), nullable=True),
        sa.Column('deployment', sa.String(100), nullable=True),
        sa.Column('extra_headers', sa.JSON, nullable=True),
        sa.Column('response_format', sa.Enum('auto', 'text', 'json', name='responseformat'), default='auto', nullable=False),
        sa.Column('key_vault_ref', sa.String(200), nullable=False),
        sa.Column('key_last_four', sa.String(4), nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('last_validated_at', sa.DateTime, nullable=True),
        sa.Column('last_test_latency_ms', sa.Integer, nullable=True),
        sa.Column('total_usage_count', sa.Integer, default=0, nullable=False),
        sa.Column('usage_today', sa.Integer, default=0, nullable=False),
        sa.Column('usage_this_month', sa.Integer, default=0, nullable=False),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
        sa.Column('last_used_by_user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('daily_limit', sa.Integer, nullable=True),
        sa.Column('per_user_daily_limit', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
    )
    
    # Create llm_shared_key_usage table
    op.create_table(
        'llm_shared_key_usage',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('shared_key_account_name', sa.String(100), sa.ForeignKey('llm_shared_keys.account_name'), nullable=False, index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('usage_today', sa.Integer, default=0, nullable=False),
        sa.Column('usage_this_month', sa.Integer, default=0, nullable=False),
        sa.Column('total_usage_count', sa.Integer, default=0, nullable=False),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),
    )
    
    # Add new columns to llm_configs table
    op.add_column('llm_configs', sa.Column('use_shared_key', sa.Boolean, default=False, nullable=False, server_default='0'))
    op.add_column('llm_configs', sa.Column('shared_key_account_name', sa.String(100), sa.ForeignKey('llm_shared_keys.account_name'), nullable=True, index=True))
    
    # Make personal key columns nullable (since they're not needed when using shared key)
    op.alter_column('llm_configs', 'provider', existing_type=sa.Enum('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom', name='llmprovider'), nullable=True)
    op.alter_column('llm_configs', 'model', existing_type=sa.String(100), nullable=True)
    op.alter_column('llm_configs', 'key_vault_ref', existing_type=sa.String(200), nullable=True)
    op.alter_column('llm_configs', 'key_last_four', existing_type=sa.String(4), nullable=True)
    
    # Add shared_key_account_name column to llm_audit_logs
    op.add_column('llm_audit_logs', sa.Column('shared_key_account_name', sa.String(100), nullable=True))


def downgrade():
    # Remove columns from llm_audit_logs
    op.drop_column('llm_audit_logs', 'shared_key_account_name')
    
    # Revert llm_configs columns to non-nullable
    op.alter_column('llm_configs', 'key_last_four', existing_type=sa.String(4), nullable=False)
    op.alter_column('llm_configs', 'key_vault_ref', existing_type=sa.String(200), nullable=False)
    op.alter_column('llm_configs', 'model', existing_type=sa.String(100), nullable=False)
    op.alter_column('llm_configs', 'provider', existing_type=sa.Enum('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom', name='llmprovider'), nullable=False)
    
    # Remove new columns from llm_configs
    op.drop_column('llm_configs', 'shared_key_account_name')
    op.drop_column('llm_configs', 'use_shared_key')
    
    # Drop tables
    op.drop_table('llm_shared_key_usage')
    op.drop_table('llm_shared_keys')

