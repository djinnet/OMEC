import requests

class FetchNamesManager:
    
    def __init__(self):
        print("FetchNamesManager initialized")

    @classmethod
    def fetch_names(cls, mode: str) -> list:
        try:
            if mode == "pokemon":
                return cls.fetch_pokemon_names()
            elif mode == "digimon":
                return cls.fetch_digimon_names()
            elif mode == "temtem":
                return cls.fetch_temtem_names()
            elif mode == "coromon":
                return cls.fetch_coromon_names()
            elif mode == "kindredfates":
                return cls.fetch_kindredfates_names()
            elif mode == "monstercrown":
                return []
            elif mode == "palworld":
                return cls.fetch_palworld_names()
            else:
                return []
        except Exception as e:
            print(f"Error fetching names for mode {mode}: {e}")
            return []
        
    @classmethod
    def fetch_pokemon_names(cls) -> list:
        try:
            r = requests.get("https://pokeapi.co/api/v2/pokemon?limit=10000")
            if r.status_code == 200:
                data = r.json()
                return [entry["name"] for entry in data["results"]]
            return []
        except Exception as e:
            print(f"Error fetching Pokémon names: {e}")
            return []

    @classmethod
    def fetch_digimon_names(cls) -> list:
        try:
            r = requests.get("https://digimon-api.vercel.app/api/digimon")
            if r.status_code == 200:
                data = r.json()
                return [entry["name"] for entry in data]
            return []
        except Exception as e:
            print(f"Error fetching Digimon names: {e}")
            return []
        
    @classmethod
    def fetch_temtem_names(cls) -> list:
        try:
            r = requests.get("https://temtem-api.mael.tech/api/temtems")
            if r.status_code == 200:
                data = r.json()
                return [entry["name"] for entry in data]
            return []
        except Exception as e:
            print(f"Error fetching Temtem names: {e}")
            return []
    
    @classmethod
    def fetch_coromon_names(cls) -> list:
        try:
            cargo_url = "https://coromon.fandom.com/api.php"
            params = {
                "action": "query",
                "list": "categorymembers",
                "cmtitle": "Category:Coromon",
                "cmlimit": "max",
                "format": "json"
            }
            r = requests.get(cargo_url, params=params)
            all_names = []
            if r.status_code == 200:
                responsejson = r.json()
                members = responsejson["query"]["categorymembers"]
                all_names.extend([m["title"] for m in members])
                return all_names
            return []
        except Exception as e:
            print(f"Error fetching Coromon names: {e}")
            return []
    
    @classmethod
    def fetch_kindredfates_names(cls) -> list:
        try:
            cargo_url = "https://www.kindredfateswiki.com/api.php"
            params = {
                "action": "cargoquery",
                "tables": "Kinfolk",
                "fields": "name",
                "format": "json",
                "origin": "*"
            }
            r = requests.get(cargo_url, params=params)
            if r.status_code == 200:
                data = r.json()
                names = [item["title"]["name"] for item in data.get("cargoquery", [])]
                return names
            return []
        except Exception as e:
            print(f"Error fetching Kindred Fates names: {e}")
            return []
        
    @classmethod
    def fetch_palworld_names(cls) -> list:
        try:
            cargo_url = "https://palworld.wiki.gg/api.php"
            params = {
                "action": "cargoquery",
                "tables": "Pals",
                "fields": "Pal",
                "format": "json",
                "origin": "*"
            }
            r = requests.get(cargo_url, params=params)
            if r.status_code == 200:
                data = r.json()
                names = [item["title"]["Pal"] for item in data.get("cargoquery", [])]
                return names
            return []
        except Exception as e:
            print(f"Error fetching Palworld names: {e}")
            return []