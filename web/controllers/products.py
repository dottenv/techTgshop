from flask import Blueprint, render_template, request
from datetime import datetime

products_bp = Blueprint('products', __name__)


@products_bp.route('/')
def index():
    q = (request.args.get('q') or '').strip()
    supplier = (request.args.get('supplier') or '').strip()
    status = (request.args.get('status') or '').strip()
    model = (request.args.get('model') or '').strip()
    color = (request.args.get('color') or '').strip()
    price_min_raw = (request.args.get('price_min') or '').strip()
    price_max_raw = (request.args.get('price_max') or '').strip()
    date_from_raw = (request.args.get('purchase_date_from') or '').strip()
    date_to_raw = (request.args.get('purchase_date_to') or '').strip()

    products = [
        {
            'id': 1,
            'sku': 'IP15-PRO-128-BLK',
            'name': 'iPhone 15 Pro 128GB Черный',
            'category': 'Смартфоны',
            'supplier': 'Apple Russia',
            'purchase_date': '12.03.2024',
            'purchase_price': 95000,
            'price': 119990,
            'stock': 15,
            'reserved': 4,
            'status': 'active',
        },
        {
            'id': 5,
            'sku': 'IP15-PRO-256-WHT',
            'name': 'iPhone 15 Pro 256GB Белый',
            'category': 'Смартфоны',
            'supplier': 'Apple Russia',
            'purchase_date': '12.03.2024',
            'purchase_price': 105000,
            'price': 139990,
            'stock': 10,
            'reserved': 3,
            'status': 'active',
        },
        {
            'id': 3,
            'sku': 'APD-PRO-2',
            'name': 'AirPods Pro 2',
            'category': 'Аксессуары',
            'supplier': 'Apple Russia',
            'purchase_date': '01.03.2024',
            'purchase_price': 18000,
            'price': 22990,
            'stock': 25,
            'reserved': 5,
            'status': 'active',
        },
        {
            'id': 4,
            'sku': 'MBAM2-13-SLV',
            'name': 'MacBook Air 13 M2',
            'category': 'Ноутбуки',
            'supplier': 'Apple Russia',
            'purchase_date': '20.02.2024',
            'purchase_price': 105000,
            'price': 139990,
            'stock': 3,
            'reserved': 1,
            'status': 'low_stock',
        },
        {
            'id': 6,
            'sku': 'IP15-PRO-256-GRN',
            'name': 'iPhone 15 Pro 256GB Зеленый',
            'category': 'Смартфоны',
            'supplier': 'Apple Russia',
            'purchase_date': '12.03.2024',
            'purchase_price': 105000,
            'price': 139990,
            'stock': 10,
            'reserved': 3,
            'status': 'active',
        },
        {
            'id': 7,
            'sku': 'IP15-PRO-256-PNK',
            'name': 'iPhone 15 Pro 256GB Розовый',
            'category': 'Смартфоны',
            'supplier': 'Apple Russia',
            'purchase_date': '12.03.2024',
            'purchase_price': 105000,
            'price': 139990,
            'stock': 10,
            'reserved': 3,
            'status': 'active',
        },
        {
            'id': 8,
            'sku': 'IP15-PRO-256-BLU',
            'name': 'iPhone 15 Pro 256GB Синий',
            'category': 'Смартфоны',
            'supplier': 'Apple Russia',
            'purchase_date': '12.03.2024',
            'purchase_price': 105000,
            'price': 139990,
            'stock': 10,
            'reserved': 3,
            'status': 'active',
        }
    ]

    price_min = None
    price_max = None
    try:
        if price_min_raw:
            price_min = int(price_min_raw)
    except ValueError:
        price_min = None
    try:
        if price_max_raw:
            price_max = int(price_max_raw)
    except ValueError:
        price_max = None

    date_from = None
    date_to = None
    try:
        if date_from_raw:
            date_from = datetime.strptime(date_from_raw, '%Y-%m-%d').date()
    except ValueError:
        date_from = None
    try:
        if date_to_raw:
            date_to = datetime.strptime(date_to_raw, '%Y-%m-%d').date()
    except ValueError:
        date_to = None

    def matches(product):
        text = f"{product['name']} {product['sku']} {product['category']}".lower()
        supplier_text = product['supplier'].lower()

        if q and q.lower() not in text:
            return False
        if model and model.lower() not in text:
            return False
        if supplier and supplier.lower() not in supplier_text:
            return False
        if color and color.lower() not in product['name'].lower():
            return False
        if status:
            if status == 'active' and product['status'] != 'active':
                return False
            if status == 'low_stock' and product['status'] != 'low_stock':
                return False
            if status == 'inactive' and product['status'] != 'inactive':
                return False
        if price_min is not None and product['price'] < price_min:
            return False
        if price_max is not None and product['price'] > price_max:
            return False
        if date_from or date_to:
            try:
                pd = datetime.strptime(product['purchase_date'], '%d.%m.%Y').date()
            except ValueError:
                pd = None
            if pd:
                if date_from and pd < date_from:
                    return False
                if date_to and pd > date_to:
                    return False
        return True

    filtered_products = [p for p in products if matches(p)]

    for p in filtered_products:
        p['available'] = max(p['stock'] - p['reserved'], 0)

    filters = {
        'q': q,
        'supplier': supplier,
        'status': status,
        'model': model,
        'color': color,
        'price_min': price_min_raw,
        'price_max': price_max_raw,
        'purchase_date_from': date_from_raw,
        'purchase_date_to': date_to_raw,
    }

    return render_template('products/list.html', products=filtered_products, filters=filters)
