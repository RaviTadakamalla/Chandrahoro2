"""Database configuration and session management for ChandraHoro."""

import os
import ssl
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import logging

logger = logging.getLogger(__name__)

# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro"
)

# Configure SSL for Azure MySQL if needed
connect_args = {}
if "azure.com" in DATABASE_URL or os.getenv("AZURE_MYSQL_SSL", "false").lower() == "true":
    # Azure MySQL requires SSL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args = {"ssl": ssl_context}
    logger.info("Configuring SSL for Azure MySQL connection")

# Create async engine
engine = create_async_engine(
    DATABASE_URL.split("?")[0],  # Remove query parameters if any
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
    poolclass=NullPool,  # Disable connection pooling for serverless
    connect_args=connect_args,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Declarative base for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session.
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized")


async def close_db():
    """Close database connection."""
    await engine.dispose()
    logger.info("Database connection closed")

