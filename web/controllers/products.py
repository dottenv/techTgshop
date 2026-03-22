from flask import Blueprint, render_template, request

products_bp = Blueprint('products', __name__)


@products_bp.route('/')
def index():
    q = (request.args.get('q') or '').strip()
    supplier = (request.args.get('supplier') or '').strip()
    status = (request.args.get('status') or '').strip()

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
            'id': 2,
            'sku': 'SGS24-256-GRN',
            'name': 'Samsung Galaxy S24 256GB Зеленый',
            'category': 'Смартфоны',
            'supplier': 'Samsung Distribution',
            'purchase_date': '05.03.2024',
            'purchase_price': 68000,
            'price': 94990,
            'stock': 8,
            'reserved': 2,
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
    ]

    def matches(product):
        text = f"{product['name']} {product['sku']} {product['category']}".lower()
        supplier_text = product['supplier'].lower()

        if q and q.lower() not in text:
            return False
        if supplier and supplier.lower() not in supplier_text:
            return False
        if status:
            if status == 'active' and product['status'] != 'active':
                return False
            if status == 'low_stock' and product['status'] != 'low_stock':
                return False
            if status == 'inactive' and product['status'] != 'inactive':
                return False
        return True

    filtered_products = [p for p in products if matches(p)]

    for p in filtered_products:
        p['available'] = max(p['stock'] - p['reserved'], 0)

    filters = {
        'q': q,
        'supplier': supplier,
        'status': status,
    }

    return render_template('products/list.html', products=filtered_products, filters=filters)
