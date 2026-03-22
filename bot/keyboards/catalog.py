"""
Catalog Keyboard
"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


async def get_catalog_keyboard() -> InlineKeyboardMarkup:
    """Get catalog keyboard with categories"""
    # TODO: Get categories from database
    # For now, show placeholder categories
    keyboard = [
        [
            InlineKeyboardButton(text="📱 Электроника", callback_data="category_1"),
            InlineKeyboardButton(text="👕 Одежда", callback_data="category_2"),
        ],
        [
            InlineKeyboardButton(text="🏠 Дом и сад", callback_data="category_3"),
            InlineKeyboardButton(text="📚 Книги", callback_data="category_4"),
        ],
        [
            InlineKeyboardButton(text="🔙 Назад", callback_data="main_menu"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


async def get_back_to_catalog_keyboard() -> InlineKeyboardMarkup:
    """Get back to catalog keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="🔙 В каталог", callback_data="catalog"),
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)
