import json
import os

class ProviderManager:
    PROVIDER_FILE = "providers.json"
    def __init__(self):
        print("ProviderManager initialized")
        self.settings = self.load_provider_settings()
        
    @classmethod
    def load_provider_settings(cls):
        if not os.path.exists(cls.PROVIDER_FILE):
            return {}
        with open(cls.PROVIDER_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def save_provider_settings(cls, settings):
        with open(cls.PROVIDER_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)