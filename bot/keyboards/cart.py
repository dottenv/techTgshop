"""
Cart Keyboard
"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


async def get_cart_keyboard() -> InlineKeyboardMarkup:
    """Get cart keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="💳 Оформить заказ", callback_data="checkout"),
        ],
        [
            InlineKeyboardButton(text="🗑️ Очистить корзину", callback_data="clear_cart"),
        ],
        [
            InlineKeyboardButton(text="🔙 В каталог", callback_data="catalog"),
            InlineKeyboardButton(text="🏠 Главное меню", callback_data="main_menu"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


async def get_back_to_cart_keyboard() -> InlineKeyboardMarkup:
    """Get back to cart keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="🔙 В корзину", callback_data="cart"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)
