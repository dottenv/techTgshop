"""
Catalog Handler
"""
from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

router = Router()


@router.callback_query(F.data == "catalog")
async def catalog_callback(callback: CallbackQuery, state: FSMContext):
    """Handle catalog callback"""
    from bot.keyboards.catalog import get_catalog_keyboard
    
    text = (
        "📦 <b>Каталог товаров</b>\n\n"
        "Выберите категорию:"
    )
    
    await callback.message.edit_text(
        text,
        reply_markup=await get_catalog_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data.startswith("category_"))
async def category_callback(callback: CallbackQuery, state: FSMContext):
    """Handle category selection"""
    category_id = callback.data.split("_")[1]
    
    # TODO: Get products from database
    # For now, show placeholder
    text = (
        f"📂 <b>Категория #{category_id}</b>\n\n"
        "Здесь будут товары категории..."
    )
    
    from bot.keyboards.catalog import get_back_to_catalog_keyboard
    
    await callback.message.edit_text(
        text,
        reply_markup=await get_back_to_catalog_keyboard()
    )
    await callback.answer()
