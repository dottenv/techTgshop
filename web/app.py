"""
Flask Web Admin Panel - Tortoise-ORM
Автономный запуск с инициализацией БД
"""
import asyncio
from flask import Flask
from flask_login import LoginManager
from tortoise import Tortoise
from tortoise.exceptions import DBConnectionError

from shared.config import settings
from web.controllers.auth import auth_bp
from web.controllers.products import products_bp
from web.controllers.orders import orders_bp
from web.controllers.plugins import plugins_bp
from web.controllers.dashboard import dashboard_bp


async def init_database():
    """Initialize database with Tortoise-ORM"""
    try:
        await Tortoise.init(
            db_url=settings.database_url,
            modules={'models': [
                'shared.database.models',
                'web.models.admin'
            ]}
        )
        await Tortoise.generate_schemas()
        print("Database initialized successfully")
        return True
    except DBConnectionError as e:
        print(f"Database connection error: {e}")
        return False
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False


def create_app():
    """Create Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = settings.web_secret_key
    
    # Initialize login manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please login to access admin panel'
    
    @login_manager.user_loader
    def load_user(user_id):
        # Will be handled by Flask-Login with Tortoise
        return None
    
    # Register blueprints
    # Note: dashboard_bp is registered at root '/'
    app.register_blueprint(dashboard_bp, url_prefix='/')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(plugins_bp, url_prefix='/plugins')
    
    return app


if __name__ == '__main__':
    # Initialize database before running
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    if not loop.run_until_complete(init_database()):
        print("Failed to initialize database. Exiting...")
        exit(1)
    
    app = create_app()
    print(f"Starting admin panel on http://{settings.web_host}:{settings.web_port}")
    app.run(
        host=settings.web_host,
        port=settings.web_port,
        debug=settings.web_debug
    )
