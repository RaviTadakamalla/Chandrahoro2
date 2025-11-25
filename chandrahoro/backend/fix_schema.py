#!/usr/bin/env python3
"""Fix database schema by adding missing columns."""
import asyncio
import os
import ssl
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def fix_schema():
    """Add missing columns to the database."""
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return

    print(f"Connecting to database...")

    # Configure SSL for Azure MySQL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    engine = create_async_engine(
        database_url,
        echo=True,
        connect_args={"ssl": ssl_context}
    )
    
    async with engine.begin() as conn:
        print("\n=== Adding missing columns to llm_configs ===")
        
        # Add use_shared_key column
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs ADD COLUMN use_shared_key BOOLEAN NOT NULL DEFAULT 0"
            ))
            print("✓ Added use_shared_key column")
        except Exception as e:
            print(f"✗ use_shared_key: {e}")
        
        # Add shared_key_account_name column
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs ADD COLUMN shared_key_account_name VARCHAR(100) NULL"
            ))
            print("✓ Added shared_key_account_name column")
        except Exception as e:
            print(f"✗ shared_key_account_name: {e}")

        # Add use_owner_name column (from migration 004)
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs ADD COLUMN use_owner_name BOOLEAN NOT NULL DEFAULT 0"
            ))
            print("✓ Added use_owner_name column")
        except Exception as e:
            print(f"✗ use_owner_name: {e}")

        # Add key_owner_name column (from migration 004)
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs ADD COLUMN key_owner_name VARCHAR(100) NULL"
            ))
            print("✓ Added key_owner_name column")
        except Exception as e:
            print(f"✗ key_owner_name: {e}")

        print("\n=== Adding missing columns to llm_audit_logs ===")
        
        # Add shared_key_account_name to llm_audit_logs
        try:
            await conn.execute(text(
                "ALTER TABLE llm_audit_logs ADD COLUMN shared_key_account_name VARCHAR(100) NULL"
            ))
            print("✓ Added shared_key_account_name to llm_audit_logs")
        except Exception as e:
            print(f"✗ llm_audit_logs.shared_key_account_name: {e}")
        
        print("\n=== Making columns nullable ===")
        
        # Make provider nullable
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs MODIFY COLUMN provider ENUM('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom') NULL"
            ))
            print("✓ Made provider nullable")
        except Exception as e:
            print(f"✗ provider nullable: {e}")
        
        # Make model nullable
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs MODIFY COLUMN model VARCHAR(100) NULL"
            ))
            print("✓ Made model nullable")
        except Exception as e:
            print(f"✗ model nullable: {e}")
        
        # Make key_vault_ref nullable
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs MODIFY COLUMN key_vault_ref VARCHAR(200) NULL"
            ))
            print("✓ Made key_vault_ref nullable")
        except Exception as e:
            print(f"✗ key_vault_ref nullable: {e}")
        
        # Make key_last_four nullable
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs MODIFY COLUMN key_last_four VARCHAR(4) NULL"
            ))
            print("✓ Made key_last_four nullable")
        except Exception as e:
            print(f"✗ key_last_four nullable: {e}")

        print("\n=== Checking current ENUM values ===")

        # Check current provider enum
        try:
            result = await conn.execute(text(
                "SHOW COLUMNS FROM llm_configs LIKE 'provider'"
            ))
            row = result.fetchone()
            if row:
                print(f"Current provider column definition: {row}")
        except Exception as e:
            print(f"✗ Error checking provider enum: {e}")

        print("\n=== Updating ENUM values ===")

        # Update provider enum to include all providers
        try:
            await conn.execute(text(
                "ALTER TABLE llm_configs MODIFY COLUMN provider "
                "ENUM('openai', 'azure-openai', 'anthropic', 'google', 'openrouter', 'mistral', 'together', 'groq', 'perplexity', 'cohere', 'xai', 'ollama', 'custom') NULL"
            ))
            print("✓ Updated provider enum with all values")

            # Verify the update
            result = await conn.execute(text(
                "SHOW COLUMNS FROM llm_configs LIKE 'provider'"
            ))
            row = result.fetchone()
            if row:
                print(f"New provider column definition: {row}")
        except Exception as e:
            print(f"✗ provider enum update: {e}")

        print("\n=== Checking for data issues ===")

        # Check if there are any llm_configs with provider='perplexity'
        try:
            result = await conn.execute(text(
                "SELECT id, user_id, provider FROM llm_configs WHERE provider = 'perplexity'"
            ))
            rows = result.fetchall()
            if rows:
                print(f"Found {len(rows)} llm_configs with provider='perplexity':")
                for row in rows:
                    print(f"  - ID: {row[0]}, User ID: {row[1]}, Provider: {row[2]}")
            else:
                print("No llm_configs with provider='perplexity' found")
        except Exception as e:
            print(f"✗ Error checking llm_configs: {e}")

    await engine.dispose()
    print("\n=== Schema fix complete ===")

if __name__ == "__main__":
    asyncio.run(fix_schema())

