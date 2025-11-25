#!/usr/bin/env python3
"""Check vault reference in database."""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def check_config():
    db_url = "mysql+aiomysql://azureuser:Jairam12@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro?ssl_ca=/etc/ssl/certs/ca-certificates.crt"
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(
            text("SELECT id, user_id, provider, key_vault_ref, key_last_four, use_owner_name, key_owner_name FROM llm_configs WHERE user_id = '9f58c592-0394-48be-83af-ee905650d0e0'")
        )
        row = result.fetchone()
        if row:
            print(f"ID: {row[0]}")
            print(f"User ID: {row[1]}")
            print(f"Provider: {row[2]}")
            print(f"Vault Ref: {row[3]}")
            print(f"Last 4: {row[4]}")
            print(f"Use Owner Name: {row[5]}")
            print(f"Owner Name: {row[6]}")
        else:
            print("No config found")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_config())

