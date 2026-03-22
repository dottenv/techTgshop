"""
Web Admin Panel Runner
"""
import asyncio
from web.app import create_app, init_database

if __name__ == '__main__':
    # Initialize database before running
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    if not loop.run_until_complete(init_database()):
        print("Failed to initialize database. Exiting...")
        exit(1)
    
    app = create_app()
    print("🚀 Starting TechTGShop Admin Panel")
    print("📊 Dashboard: http://localhost:5000")
    print("🔐 Login: http://localhost:5000/auth/login")
    print("📦 Products: http://localhost:5000/products")
    print("📋 Orders: http://localhost:5000/orders")
    print("🔌 Plugins: http://localhost:5000/plugins")
    print("-" * 50)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
