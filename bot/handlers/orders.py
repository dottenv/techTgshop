"""
Orders Handler
"""
from aiogram import Router, F
from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext

router = Router()


@router.callback_query(F.data == "orders")
async def orders_callback(callback: CallbackQuery, state: FSMContext):
    """Handle orders callback"""
    # TODO: Get user orders from database
    # For now, show placeholder
    text = (
        "📋 <b>Мои заказы</b>\n\n"
        "У вас пока нет заказов\n\n"
        "Сделайте первый заказ в каталоге!"
    )
    
    from bot.keyboards.main_menu import get_main_menu_keyboard
    
    await callback.message.edit_text(
        text,
        reply_markup=await get_main_menu_keyboard()
    )
    await callback.answer()
