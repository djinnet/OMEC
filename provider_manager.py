import json
import os

class ProviderManager:
    PROVIDER_FILE = "providers.json"
    def __init__(self):
        print("ProviderManager initialized")
        self.settings = self.load_provider_settings()
        
    @classmethod
    def load_provider_settings(cls):
        try:
            if not os.path.exists(cls.PROVIDER_FILE):
                return {}
            with open(cls.PROVIDER_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading provider settings:", e)
            return {}
        except json.JSONDecodeError as e:
            print("Error decoding JSON from provider settings:", e)
            return {}

    @classmethod
    def save_provider_settings(cls, settings):
        with open(cls.PROVIDER_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)