"""
Example Plugin Bot Handlers
"""
from aiogram import Router, F
from aiogram.types import CallbackQuery

router = Router()


@router.callback_query(F.data == "example_plugin")
async def example_plugin_callback(callback: CallbackQuery):
    """Handle example plugin callback"""
    text = (
        "🔌 <b>Example Plugin</b>\n\n"
        "Это пример плагина!\n\n"
        "Плагины могут расширять функционал бота и веб-панели."
    )
    
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu")]
    ])
    
    await callback.message.edit_text(text, reply_markup=keyboard)
    await callback.answer()
