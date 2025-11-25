"""Alembic environment configuration."""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys
import ssl

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base
from app.models import *  # noqa: F401, F403

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the sqlalchemy.url from environment variable
# Use pymysql for synchronous migrations (alembic doesn't support async)
database_url = os.getenv("DATABASE_URL", "mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro")
# Convert aiomysql to pymysql for alembic migrations
database_url = database_url.replace("mysql+aiomysql://", "mysql+pymysql://")
config.set_main_option("sqlalchemy.url", database_url)

# Model's MetaData object for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section)
    database_url = os.getenv(
        "DATABASE_URL",
        "mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro"
    )
    # Convert aiomysql to pymysql for alembic migrations
    database_url = database_url.replace("mysql+aiomysql://", "mysql+pymysql://")
    configuration["sqlalchemy.url"] = database_url

    # Configure SSL for Azure MySQL if needed
    connect_args = {}
    if "azure.com" in database_url or os.getenv("AZURE_MYSQL_SSL", "false").lower() == "true":
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args = {"ssl": ssl_context}

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

