#!/usr/bin/env python3
"""Clear old LLM config with invalid encrypted data."""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def clear_config():
    db_url = "mysql+aiomysql://azureuser:Jairam12@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro?ssl_ca=/etc/ssl/certs/ca-certificates.crt"
    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Delete the old config with invalid encrypted data
        result = await session.execute(
            text("DELETE FROM llm_configs WHERE user_id = '9f58c592-0394-48be-83af-ee905650d0e0'")
        )
        await session.commit()
        print(f"Deleted {result.rowcount} llm_config row(s)")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_config())

