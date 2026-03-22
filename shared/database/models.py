"""
Tortoise-ORM Database Models
"""
from tortoise import fields
from tortoise.models import Model


class User(Model):
    """Telegram User Model"""
    id = fields.IntField(pk=True)
    telegram_id = fields.IntField(unique=True, index=True)
    username = fields.CharField(max_length=255, null=True)
    first_name = fields.CharField(max_length=255, null=True)
    last_name = fields.CharField(max_length=255, null=True)
    is_active = fields.BooleanField(default=True)
    is_admin = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    orders: fields.ReverseRelation["Order"]
    cart_items: fields.ReverseRelation["CartItem"]
    
    class Meta:
        table = "users"


class Category(Model):
    """Product Category Model"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    is_active = fields.BooleanField(default=True)
    sort_order = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    products: fields.ReverseRelation["Product"]
    
    class Meta:
        table = "categories"


class Product(Model):
    """Product Model"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    price = fields.FloatField()
    image_url = fields.CharField(max_length=500, null=True)
    category = fields.ForeignKeyField(
        "models.Category", 
        related_name="products",
        on_delete=fields.CASCADE
    )
    is_active = fields.BooleanField(default=True)
    in_stock = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    cart_items: fields.ReverseRelation["CartItem"]
    order_items: fields.ReverseRelation["OrderItem"]
    
    class Meta:
        table = "products"


class Cart(Model):
    """Shopping Cart Model"""
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField(
        "models.User",
        related_name="carts",
        on_delete=fields.CASCADE
    )
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    items: fields.ReverseRelation["CartItem"]
    
    class Meta:
        table = "carts"


class CartItem(Model):
    """Cart Item Model"""
    id = fields.IntField(pk=True)
    cart = fields.ForeignKeyField(
        "models.Cart",
        related_name="items",
        on_delete=fields.CASCADE
    )
    user = fields.ForeignKeyField(
        "models.User",
        related_name="cart_items",
        on_delete=fields.CASCADE
    )
    product = fields.ForeignKeyField(
        "models.Product",
        related_name="cart_items",
        on_delete=fields.CASCADE
    )
    quantity = fields.IntField(default=1)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "cart_items"


class Order(Model):
    """Order Model"""
    id = fields.IntField(pk=True)
    order_number = fields.CharField(max_length=50, unique=True)
    user = fields.ForeignKeyField(
        "models.User",
        related_name="orders",
        on_delete=fields.CASCADE
    )
    total_amount = fields.FloatField()
    status = fields.CharField(max_length=50, default="pending")
    payment_method = fields.CharField(max_length=50, null=True)
    payment_id = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    items: fields.ReverseRelation["OrderItem"]
    
    class Meta:
        table = "orders"


class OrderItem(Model):
    """Order Item Model"""
    id = fields.IntField(pk=True)
    order = fields.ForeignKeyField(
        "models.Order",
        related_name="items",
        on_delete=fields.CASCADE
    )
    product = fields.ForeignKeyField(
        "models.Product",
        related_name="order_items",
        on_delete=fields.CASCADE
    )
    quantity = fields.IntField()
    price = fields.FloatField()
    
    class Meta:
        table = "order_items"


class BotSettings(Model):
    """Bot Settings Model - stored in database"""
    id = fields.IntField(pk=True)
    bot_token = fields.CharField(max_length=255, null=True)
    bot_webhook_url = fields.CharField(max_length=500, null=True)
    bot_webhook_path = fields.CharField(max_length=255, default="/webhook/bot")
    bot_username = fields.CharField(max_length=255, null=True)
    bot_name = fields.CharField(max_length=255, default="TechTGShop")
    welcome_message = fields.TextField(default="Welcome to our shop!")
    
    # Shop settings
    shop_name = fields.CharField(max_length=255, default="TechTGShop")
    shop_description = fields.TextField(null=True)
    support_contact = fields.CharField(max_length=255, null=True)
    
    # Feature toggles
    enable_cart = fields.BooleanField(default=True)
    enable_orders = fields.BooleanField(default=True)
    enable_payments = fields.BooleanField(default=False)
    
    # System
    is_active = fields.BooleanField(default=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "bot_settings"


# Tortoise-ORM configuration for aerich
TORTOISE_ORM = {
    "connections": {
        "default": "sqlite://db.sqlite3"
    },
    "apps": {
        "models": {
            "models": [
                "shared.database.models",
                "web.models.admin",
                "aerich.models"
            ],
            "default_connection": "default",
        },
    },
}
