"""
Plugins Controller
"""
from flask import Blueprint, render_template
from flask_login import login_required

plugins_bp = Blueprint('plugins', __name__)


@plugins_bp.route('/')
def index():
    """Plugins management page"""
    return render_template('plugins/list.html')
