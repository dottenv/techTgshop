"""
Example Plugin Web Routes
"""
from flask import Blueprint

example_bp = Blueprint('example_plugin', __name__)


@example_bp.route('/')
def index():
    """Example plugin web page"""
    return """
    <h1>🔌 Example Plugin</h1>
    <p>Это пример веб-страницы плагина</p>
    <p>Плагины могут добавлять новые страницы в админ-панель</p>
    <a href="/">🔙 Назад</a>
    """
