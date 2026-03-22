"""
Webhook Server for Payment Processing
"""
from flask import Flask, request, jsonify
import hmac
import hashlib
import logging

from shared.config import settings
from webhook_server.handlers.yookassa import router as yookassa_router
from webhook_server.handlers.stripe import router as stripe_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app():
    """Create Flask webhook server application"""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = settings.webhook_secret_key
    
    # Register webhook handlers
    app.register_blueprint(yookassa_router, url_prefix='/webhook/yookassa')
    app.register_blueprint(stripe_router, url_prefix='/webhook/stripe')
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({"status": "ok"})
    
    @app.route('/webhook', methods=['POST'])
    def generic_webhook():
        """Generic webhook endpoint"""
        logger.info("Received generic webhook")
        return jsonify({"status": "received"}), 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host=settings.webhook_host,
        port=settings.webhook_port,
        debug=False
    )
