"""Add AI prompt configuration tables

Revision ID: 005_add_ai_prompt_configs
Revises: 004_add_owner_name
Create Date: 2025-11-25 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '005_add_ai_prompt_configs'
down_revision = '004_add_owner_name'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create AI prompt configuration tables."""
    
    # Create ai_prompt_configs table
    op.create_table(
        'ai_prompt_configs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        
        # Module identification
        sa.Column('module_type', sa.String(50), nullable=False, index=True),
        sa.Column('module_name', sa.String(100), nullable=False),
        sa.Column('module_description', sa.Text(), nullable=True),
        
        # Scope and ownership
        sa.Column('scope', sa.String(20), nullable=False, default='system', index=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True),
        
        # Prompt configuration
        sa.Column('custom_prompt', sa.Text(), nullable=False),
        sa.Column('system_variables', sa.JSON(), nullable=True),
        sa.Column('output_format', sa.Text(), nullable=True),
        
        # Settings
        sa.Column('is_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, default=False),
        
        # Model parameters
        sa.Column('temperature', sa.String(10), nullable=True),
        sa.Column('max_tokens', sa.String(10), nullable=True),
        sa.Column('model_override', sa.String(100), nullable=True),
        
        # Metadata
        sa.Column('version', sa.String(20), nullable=False, default='1.0'),
        sa.Column('tags', sa.JSON(), nullable=True),
        
        # Usage tracking
        sa.Column('usage_count', sa.String(20), nullable=False, default='0'),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        
        # Validation
        sa.Column('is_validated', sa.Boolean(), nullable=False, default=False),
        sa.Column('validation_notes', sa.Text(), nullable=True),
        sa.Column('test_results', sa.JSON(), nullable=True),
        
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create indexes for better query performance
    op.create_index('idx_prompt_module_scope', 'ai_prompt_configs', ['module_type', 'scope'])
    op.create_index('idx_prompt_user_module', 'ai_prompt_configs', ['user_id', 'module_type'])
    
    # Create ai_prompt_versions table
    op.create_table(
        'ai_prompt_versions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        
        # Reference
        sa.Column('prompt_config_id', sa.String(36), sa.ForeignKey('ai_prompt_configs.id', ondelete='CASCADE'), nullable=False, index=True),
        
        # Version details
        sa.Column('version_number', sa.String(20), nullable=False),
        sa.Column('prompt_content', sa.Text(), nullable=False),
        sa.Column('output_format', sa.Text(), nullable=True),
        
        # Change tracking
        sa.Column('changed_by_user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('change_notes', sa.Text(), nullable=True),
        
        # Performance metrics
        sa.Column('avg_response_time_ms', sa.String(20), nullable=True),
        sa.Column('success_rate', sa.String(10), nullable=True),
        sa.Column('user_satisfaction', sa.String(10), nullable=True),
        
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Create index for version lookup
    op.create_index('idx_version_config', 'ai_prompt_versions', ['prompt_config_id', 'version_number'])


def downgrade() -> None:
    """Drop AI prompt configuration tables."""
    op.drop_index('idx_version_config', table_name='ai_prompt_versions')
    op.drop_table('ai_prompt_versions')
    
    op.drop_index('idx_prompt_user_module', table_name='ai_prompt_configs')
    op.drop_index('idx_prompt_module_scope', table_name='ai_prompt_configs')
    op.drop_table('ai_prompt_configs')

