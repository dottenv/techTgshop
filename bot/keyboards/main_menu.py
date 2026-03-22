"""
Main Menu Keyboard
"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


async def get_main_menu_keyboard() -> InlineKeyboardMarkup:
    """Get main menu keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="📦 Каталог", callback_data="catalog"),
        ],
        [
            InlineKeyboardButton(text="🛒 Корзина", callback_data="cart"),
        ],
        [
            InlineKeyboardButton(text="📋 Мои заказы", callback_data="orders"),
        ],
        [
            InlineKeyboardButton(text="ℹ️ О магазине", callback_data="about"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


async def get_about_keyboard() -> InlineKeyboardMarkup:
    """Get about keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)
