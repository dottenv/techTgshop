"""
Start Command Handler
"""
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

router = Router()


@router.callback_query(F.data == "main_menu")
async def main_menu_callback(callback: CallbackQuery, state: FSMContext):
    """Handle main menu callback"""
    await state.clear()
    
    from bot.keyboards.main_menu import get_main_menu_keyboard
    
    welcome_text = (
        "🛍️ <b>Главное меню</b>\n\n"
        "Выберите действие:"
    )
    
    await callback.message.edit_text(
        welcome_text,
        reply_markup=await get_main_menu_keyboard()
    )
    await callback.answer()
