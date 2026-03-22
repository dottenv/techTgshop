"""
Admin User Model for Web Panel - Tortoise-ORM
"""
from tortoise import fields
from tortoise.models import Model
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class AdminUser(Model, UserMixin):
    """Admin User Model for Web Panel"""
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True, null=True)
    is_active = fields.BooleanField(default=True)
    is_superadmin = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password"""
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        """Return user id for Flask-Login"""
        return str(self.id)
    
    class Meta:
        table = "admin_users"
