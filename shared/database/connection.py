"""
Tortoise-ORM Database Connection
"""
from tortoise import Tortoise
from shared.config import settings


async def init_db():
    """Initialize Tortoise-ORM"""
    await Tortoise.init(
        db_url=settings.database_url,
        modules={'models': ['shared.database.models']}
    )


async def close_db():
    """Close database connections"""
    await Tortoise.close_connections()


async def generate_schemas():
    """Generate database schemas"""
    await Tortoise.generate_schemas()
