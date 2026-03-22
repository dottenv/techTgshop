"""
Cart Handler
"""
from aiogram import Router, F
from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext

router = Router()


@router.callback_query(F.data == "cart")
async def cart_callback(callback: CallbackQuery, state: FSMContext):
    """Handle cart callback"""
    # TODO: Get cart items from database
    # For now, show placeholder
    text = (
        "🛒 <b>Ваша корзина</b>\n\n"
        "Корзина пуста\n\n"
        "Добавьте товары из каталога!"
    )
    
    from bot.keyboards.cart import get_cart_keyboard
    
    await callback.message.edit_text(
        text,
        reply_markup=await get_cart_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data == "checkout")
async def checkout_callback(callback: CallbackQuery, state: FSMContext):
    """Handle checkout callback"""
    text = (
        "💳 <b>Оформление заказа</b>\n\n"
        "Функция оформления заказа будет доступна в следующей версии..."
    )
    
    from bot.keyboards.cart import get_back_to_cart_keyboard
    
    await callback.message.edit_text(
        text,
        reply_markup=await get_back_to_cart_keyboard()
    )
    await callback.answer()
