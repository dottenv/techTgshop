"""
Orders Controller
"""
from flask import Blueprint, render_template
from flask_login import login_required

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/')
def index():
    """Orders management page"""
    return render_template('orders/list.html')
