"""
Orders Controller
"""
from flask import Blueprint, render_template
from flask_login import login_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/')
# @login_required
def index():
    """Dashboard page"""
    print("DEBUG: Dashboard index called")
    # Расширенные mock данные для дашборда магазина техники
    stats = {
        'orders_count': '1,234',
        'revenue': '₽1,456,000',
        'profit': '₽320,000',
        'customers_count': '567',
        'preorders_count': '42'
    }
    
    recent_orders = [
        {'id': '1234', 'customer': 'Иван Иванов', 'product': 'iPhone 15 Pro', 'price': '125,000', 'status': 'Оплачен', 'color': 'success'},
        {'id': '1233', 'customer': 'Петр Петров', 'product': 'AirPods Pro 2', 'price': '22,000', 'status': 'В обработке', 'color': 'warning'},
        {'id': '1232', 'customer': 'Анна Сидорова', 'product': 'MacBook Air M2', 'price': '115,000', 'status': 'Доставлен', 'color': 'info'},
        {'id': '1231', 'customer': 'Мария Кузнецова', 'product': 'iPad Pro 11', 'price': '89,000', 'status': 'Отменен', 'color': 'danger'},
    ]

    recent_preorders = [
        {'id': 'P-501', 'customer': 'Алексей Волков', 'product': 'Samsung S24 Ultra', 'date': '24.03.2024', 'status': 'Ожидает'},
        {'id': 'P-502', 'customer': 'Елена Морозова', 'product': 'Xiaomi 14 Pro', 'date': '25.03.2024', 'status': 'Подтвержден'},
    ]

    low_stock = [
        {'name': 'iPhone 13 128GB', 'sku': 'IP13-128-BLK', 'qty': 2, 'status': 'critical'},
        {'name': 'Apple Watch Series 9', 'sku': 'AW9-45-SLV', 'qty': 5, 'status': 'low'},
        {'name': 'USB-C Cable 2m', 'sku': 'CABLE-UC-2M', 'qty': 1, 'status': 'critical'},
    ]

    top_users = [
        {'name': 'Иван Иванов', 'total': '₽450,000', 'orders': 12, 'avatar': '1.jpg'},
        {'name': 'Мария Смирнова', 'total': '₽380,000', 'orders': 8, 'avatar': '2.jpg'},
        {'name': 'Дмитрий Соколов', 'total': '₽310,000', 'orders': 15, 'avatar': '3.jpg'},
        {'name': 'Ольга Попова', 'total': '₽290,000', 'orders': 5, 'avatar': '4.jpg'},
        {'name': 'Сергей Васильев', 'total': '₽250,000', 'orders': 9, 'avatar': '5.jpg'},
    ]
    
    return render_template('dashboard.html', 
                         stats=stats, 
                         orders=recent_orders, 
                         preorders=recent_preorders,
                         low_stock=low_stock,
                         top_users=top_users)
