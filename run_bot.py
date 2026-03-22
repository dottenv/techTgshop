"""
Telegram Bot Runner
Запускает только бота (отдельно от админки)
"""
import asyncio
import logging
from tortoise import Tortoise
from tortoise.exceptions import DBConnectionError

from shared.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_database():
    """Initialize database with Tortoise-ORM"""
    try:
        await Tortoise.init(
            db_url=settings.database_url,
            modules={'models': ['shared.database.models']}
        )
        await Tortoise.generate_schemas()
        logger.info("Database initialized successfully")
        return True
    except DBConnectionError as e:
        logger.error(f"Database connection error: {e}")
        return False
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        return False


async def close_database():
    """Close database connections"""
    await Tortoise.close_connections()
    logger.info("Database connections closed")


async def load_bot_settings():
    """Load bot settings from database"""
    from shared.database.models import BotSettings
    
    settings_obj = await BotSettings.filter(is_active=True).first()
    if settings_obj and settings_obj.bot_token:
        settings.bot_token = settings_obj.bot_token
        settings.bot_webhook_url = settings_obj.bot_webhook_url
        settings.bot_webhook_path = settings_obj.bot_webhook_path
        logger.info("Bot settings loaded from database")
        return True
    else:
        logger.error("No active bot settings found in database!")
        logger.info("Please configure bot token in admin panel first.")
        return False


async def run_bot():
    """Run Telegram bot"""
    try:
        from bot.main import main
        logger.info("Starting Telegram bot...")
        await main()
    except Exception as e:
        logger.error(f"Error running bot: {e}")


async def main_async():
    """Async main function"""
    logger.info("🤖 Starting Telegram Bot...")
    
    # Initialize database
    if not await init_database():
        logger.error("Failed to initialize database. Exiting...")
        return
    
    # Load bot settings from database
    if not await load_bot_settings():
        await close_database()
        return
    
    try:
        # Run bot
        await run_bot()
    except KeyboardInterrupt:
        logger.info("Shutting down bot...")
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        await close_database()


def main():
    """Main entry point"""
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
