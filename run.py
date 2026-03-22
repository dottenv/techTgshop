"""
Admin Panel & Web Services Runner
Запускает только админ-панель и вебхук сервер
"""
import asyncio
import threading
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
            modules={'models': [
                'shared.database.models',
                'web.models.admin'
            ]}
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


def run_web_app():
    """Run Flask web admin panel"""
    try:
        from web.app import create_app
        
        app = create_app()
        logger.info(f"Starting web admin panel on {settings.web_host}:{settings.web_port}")
        app.run(
            host=settings.web_host,
            port=settings.web_port,
            debug=settings.web_debug,
            use_reloader=False
        )
    except Exception as e:
        logger.error(f"Error running web app: {e}")


def run_webhook_server():
    """Run webhook server"""
    try:
        from webhook_server.app import create_app
        
        app = create_app()
        logger.info(f"Starting webhook server on {settings.webhook_host}:{settings.webhook_port}")
        app.run(
            host=settings.webhook_host,
            port=settings.webhook_port,
            debug=False,
            use_reloader=False
        )
    except Exception as e:
        logger.error(f"Error running webhook server: {e}")


async def main_async():
    """Async main function"""
    logger.info("🚀 Starting Admin Panel & Web Services...")
    
    # Initialize database
    if not await init_database():
        logger.error("Failed to initialize database. Exiting...")
        return
    
    try:
        # Start web app in separate thread
        web_thread = threading.Thread(target=run_web_app, daemon=True)
        web_thread.start()
        
        # Start webhook server in separate thread
        webhook_thread = threading.Thread(target=run_webhook_server, daemon=True)
        webhook_thread.start()
        
        # Keep main thread alive
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down services...")
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        await close_database()


def main():
    """Main entry point"""
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
