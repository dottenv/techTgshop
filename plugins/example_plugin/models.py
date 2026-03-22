"""
Example Plugin Database Models - Tortoise-ORM
"""
from tortoise import fields
from tortoise.models import Model


class ExampleModel(Model):
    """Example model for plugin"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    data = fields.CharField(max_length=500, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "example_plugin_data"
