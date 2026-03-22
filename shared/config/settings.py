"""
Application Settings - Auto-generated secrets, no .env file
"""
import secrets
from typing import Optional


def generate_secret() -> str:
    """Generate a secure random secret"""
    return secrets.token_urlsafe(32)


class Settings:
    """Main application settings with auto-generated secrets"""
    
    # Database - SQLite for development
    database_url: str = "sqlite://db.sqlite3"
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "tech_tgshop"
    database_user: str = "postgres"
    database_password: str = "postgres_password"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # Web Admin Panel - auto-generated secret
    web_secret_key: str = generate_secret()
    web_host: str = "0.0.0.0"
    web_port: int = 5000
    web_debug: bool = False
    
    # Webhook Server - auto-generated secret
    webhook_secret_key: str = generate_secret()
    webhook_host: str = "0.0.0.0"
    webhook_port: int = 8000
    
    # Payment Systems (optional, from env if provided)
    yookassa_shop_id: Optional[str] = None
    yookassa_secret_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    # Bot settings - loaded from database
    bot_token: Optional[str] = None
    bot_webhook_url: Optional[str] = None
    bot_webhook_path: str = "/webhook/bot"


# Global settings instance
settings = Settings()
