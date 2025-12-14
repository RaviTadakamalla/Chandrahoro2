"""add_ai_generated_reports

Revision ID: aa963991c245
Revises: 006_add_sample_format
Create Date: 2025-12-14 13:20:53.040563

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'aa963991c245'
down_revision = '006_add_sample_format'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ai_generated_reports table
    op.create_table(
        'ai_generated_reports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),

        # User and Chart References
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('chart_id', sa.String(36), sa.ForeignKey('birth_charts.id'), nullable=True),

        # Report Metadata
        sa.Column('report_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),

        # Report Content
        sa.Column('html_content', sa.Text, nullable=False),
        sa.Column('prompt_used', sa.Text, nullable=True),
        sa.Column('model_used', sa.String(100), nullable=True),

        # Generation Details
        sa.Column('status', sa.String(20), nullable=False, server_default='completed'),
        sa.Column('generation_time_ms', sa.String(20), nullable=True),
        sa.Column('tokens_used', sa.String(20), nullable=True),

        # Birth Details (cached for display)
        sa.Column('person_name', sa.String(255), nullable=True),
        sa.Column('birth_date', sa.String(50), nullable=True),
        sa.Column('birth_time', sa.String(50), nullable=True),
        sa.Column('birth_location', sa.String(255), nullable=True),

        # Versioning
        sa.Column('version', sa.String(20), nullable=False, server_default='1.0'),
        sa.Column('parent_report_id', sa.String(36), sa.ForeignKey('ai_generated_reports.id'), nullable=True),
        sa.Column('is_latest', sa.Boolean, nullable=False, server_default='1'),

        # User Interaction
        sa.Column('view_count', sa.String(20), nullable=False, server_default='0'),
        sa.Column('last_viewed_at', sa.DateTime, nullable=True),
        sa.Column('downloaded_count', sa.String(20), nullable=False, server_default='0'),
        sa.Column('last_downloaded_at', sa.DateTime, nullable=True),

        # User Rating
        sa.Column('user_rating', sa.String(10), nullable=True),
        sa.Column('user_feedback', sa.Text, nullable=True)
    )

    # Create indexes
    op.create_index('idx_user_report_type', 'ai_generated_reports', ['user_id', 'report_type'])
    op.create_index('idx_user_latest', 'ai_generated_reports', ['user_id', 'is_latest'])
    op.create_index('idx_chart_report', 'ai_generated_reports', ['chart_id', 'report_type'])

    # Create ai_report_shares table
    op.create_table(
        'ai_report_shares',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')),

        # Report Reference
        sa.Column('report_id', sa.String(36), sa.ForeignKey('ai_generated_reports.id'), nullable=False),

        # Share Details
        sa.Column('share_token', sa.String(64), nullable=False, unique=True),
        sa.Column('recipient_email', sa.String(255), nullable=True),
        sa.Column('recipient_name', sa.String(255), nullable=True),

        # Access Control
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('max_views', sa.String(10), nullable=True),
        sa.Column('view_count', sa.String(10), nullable=False, server_default='0'),

        # Tracking
        sa.Column('last_accessed_at', sa.DateTime, nullable=True),
        sa.Column('access_ip', sa.String(45), nullable=True)
    )

    # Create indexes for shares
    op.create_index('idx_share_token', 'ai_report_shares', ['share_token'])
    op.create_index('idx_share_report', 'ai_report_shares', ['report_id'])


def downgrade() -> None:
    # Drop tables and indexes
    op.drop_index('idx_share_report', 'ai_report_shares')
    op.drop_index('idx_share_token', 'ai_report_shares')
    op.drop_table('ai_report_shares')

    op.drop_index('idx_chart_report', 'ai_generated_reports')
    op.drop_index('idx_user_latest', 'ai_generated_reports')
    op.drop_index('idx_user_report_type', 'ai_generated_reports')
    op.drop_table('ai_generated_reports')

