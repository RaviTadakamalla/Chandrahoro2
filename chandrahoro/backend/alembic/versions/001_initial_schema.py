"""Initial schema creation

Revision ID: 001
Revises: 
Create Date: 2025-10-23

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema."""
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('role', sa.Enum('individual', 'corporate_manager', 'admin', 'analyst'), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('bio', sa.Text, nullable=True),
        sa.Column('is_verified', sa.Boolean, nullable=False, server_default='0'),
        sa.Column('is_email_verified', sa.Boolean, nullable=False, server_default='0'),
        sa.Column('last_login', sa.DateTime, nullable=True),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='UTC'),
        sa.Column('language', sa.String(10), nullable=False, server_default='en'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_is_active', 'users', ['is_active'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])
    op.create_index('ix_users_updated_at', 'users', ['updated_at'])
    
    # Create permissions table
    op.create_table(
        'permissions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('resource', sa.String(100), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )
    
    # Create role_permissions table
    op.create_table(
        'role_permissions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('role', sa.Enum('individual', 'corporate_manager', 'admin', 'analyst'), nullable=False),
        sa.Column('permission_id', sa.String(36), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['permission_id'], ['permissions.id']),
    )
    op.create_index('ix_role_permissions_role', 'role_permissions', ['role'])
    
    # Create birth_charts table
    op.create_table(
        'birth_charts',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('birth_date', sa.Date, nullable=False),
        sa.Column('birth_time', sa.Time, nullable=True),
        sa.Column('birth_latitude', sa.Float, nullable=False),
        sa.Column('birth_longitude', sa.Float, nullable=False),
        sa.Column('birth_timezone', sa.String(50), nullable=False),
        sa.Column('birth_location', sa.String(255), nullable=False),
        sa.Column('ayanamsha', sa.String(50), nullable=False, server_default='Lahiri'),
        sa.Column('house_system', sa.String(50), nullable=False, server_default='Whole Sign'),
        sa.Column('chart_style', sa.String(50), nullable=False, server_default='North Indian'),
        sa.Column('chart_data', sa.JSON, nullable=True),
        sa.Column('is_public', sa.String(1), nullable=False, server_default='N'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_birth_charts_user_id', 'birth_charts', ['user_id'])
    op.create_index('ix_birth_charts_created_at', 'birth_charts', ['created_at'])
    
    # Create strength_profiles table
    op.create_table(
        'strength_profiles',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('birth_chart_id', sa.String(36), nullable=False),
        sa.Column('risk_taking', sa.Float, nullable=True),
        sa.Column('loyalty', sa.Float, nullable=True),
        sa.Column('honesty', sa.Float, nullable=True),
        sa.Column('hardworking', sa.Float, nullable=True),
        sa.Column('logical', sa.Float, nullable=True),
        sa.Column('creativity', sa.Float, nullable=True),
        sa.Column('leadership', sa.Float, nullable=True),
        sa.Column('adaptability', sa.Float, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['birth_chart_id'], ['birth_charts.id']),
    )
    op.create_index('ix_strength_profiles_user_id', 'strength_profiles', ['user_id'])
    op.create_index('ix_strength_profiles_birth_chart_id', 'strength_profiles', ['birth_chart_id'])


def downgrade() -> None:
    """Drop initial schema."""
    op.drop_index('ix_strength_profiles_birth_chart_id', 'strength_profiles')
    op.drop_index('ix_strength_profiles_user_id', 'strength_profiles')
    op.drop_table('strength_profiles')
    
    op.drop_index('ix_birth_charts_created_at', 'birth_charts')
    op.drop_index('ix_birth_charts_user_id', 'birth_charts')
    op.drop_table('birth_charts')
    
    op.drop_index('ix_role_permissions_role', 'role_permissions')
    op.drop_table('role_permissions')
    
    op.drop_table('permissions')
    
    op.drop_index('ix_users_updated_at', 'users')
    op.drop_index('ix_users_created_at', 'users')
    op.drop_index('ix_users_is_active', 'users')
    op.drop_index('ix_users_username', 'users')
    op.drop_index('ix_users_email', 'users')
    op.drop_table('users')

