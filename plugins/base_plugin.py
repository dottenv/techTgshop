"""
Base Plugin Class
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List


class BasePlugin(ABC):
    """Base class for all plugins"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
        self.description = "Base plugin"
        self.author = "Unknown"
        self.enabled = True
    
    @abstractmethod
    def get_bot_handlers(self) -> List:
        """Return list of bot handlers"""
        pass
    
    @abstractmethod
    def get_web_routes(self) -> List:
        """Return list of web routes"""
        pass
    
    @abstractmethod
    def get_models(self) -> List:
        """Return list of database models"""
        pass
    
    def get_config_schema(self) -> Dict[str, Any]:
        """Return plugin configuration schema"""
        return {}
    
    def install(self):
        """Install plugin"""
        pass
    
    def uninstall(self):
        """Uninstall plugin"""
        pass
    
    def enable(self):
        """Enable plugin"""
        self.enabled = True
    
    def disable(self):
        """Disable plugin"""
        self.enabled = False
    
    def get_info(self) -> Dict[str, Any]:
        """Get plugin information"""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "author": self.author,
            "enabled": self.enabled
        }
