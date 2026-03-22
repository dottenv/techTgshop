"""
Example Plugin Implementation
"""
from aiogram import Router
from flask import Blueprint
from typing import List

from plugins.base_plugin import BasePlugin


class ExamplePlugin(BasePlugin):
    """Example plugin for demonstration"""
    
    def __init__(self):
        super().__init__()
        self.name = "Example Plugin"
        self.version = "1.0.0"
        self.description = "Example plugin for testing"
        self.author = "TechTGShop Team"
    
    def get_bot_handlers(self) -> List:
        """Return bot handlers for this plugin"""
        from .bot_handlers import router
        return [router]
    
    def get_web_routes(self) -> List:
        """Return web routes for this plugin"""
        from .web_routes import example_bp
        return [example_bp]
    
    def get_models(self) -> List:
        """Return database models for this plugin"""
        from .models import ExampleModel
        return [ExampleModel]
    
    def install(self):
        """Install plugin"""
        print(f"Installing {self.name}")
        # TODO: Create database tables, register hooks, etc.
    
    def uninstall(self):
        """Uninstall plugin"""
        print(f"Uninstalling {self.name}")
        # TODO: Clean up database, unregister hooks, etc.
