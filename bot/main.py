"""
Telegram Bot Main Entry Point
"""
import asyncio
import logging
from contextlib import suppress

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage

from shared.config import settings
from bot.handlers.start import router as start_router
from bot.handlers.catalog import router as catalog_router
from bot.handlers.cart import router as cart_router
from bot.handlers.orders import router as orders_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


# Initialize bot and dispatcher (will be set after loading settings)
bot = None
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

# Include routers
dp.include_router(start_router)
dp.include_router(catalog_router)
dp.include_router(cart_router)
dp.include_router(orders_router)


@dp.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    """Handle /start command"""
    await state.clear()
    
    # Load welcome message from database
    from shared.database.models import BotSettings
    bot_settings = await BotSettings.filter(is_active=True).first()
    welcome_text = bot_settings.welcome_message if bot_settings else "Welcome to our shop!"
    
    welcome_text = (
        f"🛍️ <b>{welcome_text}</b>\n\n"
        "Здесь вы можете:\n"
        "📦 Просматривать товары\n"
        "🛒 Добавлять в корзину\n"
        "💳 Оформлять заказы\n"
        "📊 Отслеживать статус заказов\n\n"
        "Выберите действие ниже:"
    )
    
    from bot.keyboards.main_menu import get_main_menu_keyboard
    
    await message.answer(
        welcome_text,
        reply_markup=await get_main_menu_keyboard()
    )


async def main():
    """Main bot function"""
    logger.info("Starting bot...")
    
    # Load settings from database
    if not await load_bot_settings():
        return
    
    # Initialize bot with token from database
    global bot
    bot = Bot(
        token=settings.bot_token,
        parse_mode=ParseMode.HTML
    )
    
    # Start bot polling
    await dp.start_polling(bot)


if __name__ == "__main__":
    with suppress(KeyboardInterrupt):
        asyncio.run(main())
