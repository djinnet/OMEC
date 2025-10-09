import requests

class FetchManager:
    def __init__(self):
        print("FetchManager initialized")
    
    @classmethod
    def fetch_pokemon(name: str, shiny: bool = False) -> str:
        try:
            base_api = f"https://pokeapi.co/api/v2/pokemon/{name.lower()}"
            r = requests.get(base_api)
            if r.status_code == 200:
                data = r.json()
                if shiny and data["sprites"]["front_shiny"]:
                    return data["sprites"]["front_shiny"]
                elif data["sprites"]["front_default"]:
                    return data["sprites"]["front_default"]
            return ""
        except Exception as e:   
            print(f"Error fetching Pokémon data: {e}")
        return ""

    @classmethod
    def fetch_digimon(name: str) -> str:
        try:
            base_api = f"https://digimon-api.vercel.app/api/digimon/name/{name.capitalize()}"
            r = requests.get(base_api)
            if r.status_code == 200:
                data = r.json()
                if data and "img" in data[0]:
                    return data[0]["img"]
            return ""
        except Exception as e:
            print(f"Error fetching Digimon data: {e}")
        return ""