from flask import Flask, render_template, request, jsonify, Response
import requests
import json
from queue import Queue

app = Flask(__name__)

state = {
    "counter": 0,
    "mode": "pokemon", # kan være "pokemon", "digimon", "temtem", osv.
    "shiny": False,
    "name":"pikachu", # default pokemon
    "generation": "default"
}

subscribers = []  # aktive SSE-klienter

def notify_clients():
    data = json.dumps(state)
    for sub in subscribers[:]:
        try:
            sub.put(data)
        except:
            subscribers.remove(sub)


def fetch_pokemon(name, shiny=False):
    """Get sprite from PokéAPI"""
    base_url = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
    poke_api = f"https://pokeapi.co/api/v2/pokemon/{name.lower()}"
    r = requests.get(poke_api)
    if r.status_code == 200:
        data = r.json()
        poke_id = data["id"]
        if shiny:
            return f"{base_url}shiny/{poke_id}.png"
        else:
            return f"{base_url}{poke_id}.png"
    return ""

def fetch_digimon(name):
    """Get image from Digimon API"""
    url = f"https://digimon-api.vercel.app/api/digimon/name/{name.capitalize()}"
    r = requests.get(url)
    if r.status_code == 200:
        data = r.json()
        if data and "img" in data[0]:
            return data[0]["img"]
    return ""

@app.route("/")
def overlay():
    return render_template("overlay.html")

@app.route("/control")
def control():
    return render_template("controls.html", **state)
    
@app.route("/names")
def names():
    mode = state["mode"]
    try:
        if mode == "pokemon":
            r = requests.get("https://pokeapi.co/api/v2/pokemon?limit=1000")
            if r.status_code == 200:
                data = r.json()
                return jsonify([p["name"] for p in data["results"]])
        elif mode == "digimon":  # digimon
            r = requests.get("https://digimon-api.vercel.app/api/digimon")
            if r.status_code == 200:
                data = r.json()
                return jsonify([d["name"] for d in data])
        elif mode == "temtem":  # temtem
            r = requests.get("https://temtem-api.mael.tech/api/temtems")
            if r.status_code == 200:
                data = r.json()
                return jsonify([t["name"] for t in data])
        elif mode == "coromon":  # coromon
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
                return jsonify(all_names)
        elif mode == "kindredfates":  # kindred fates
            # Kindred Fates: hent fra cargoquery (ligner det vi gør i provider)
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
                return jsonify(names)
        elif mode == "palworld":  # palworld
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
                return jsonify(names)
    except Exception as e:
        print(f"Error occurred while fetching names: {e}")
        
    return jsonify([])

@app.route('/update', methods=['POST'])
def update():
    """Update state"""
    data = request.get_json()
    action = data.get('action')
    
    print(f"Received action: {action} with data: {data}")
    
    if action == "inc":
        state["counter"] += 1
    elif action == "dec":
        state["counter"] = max(0, state["counter"] - 1)
    elif action == "reset":
        state["counter"] = 0
    elif action == "set_generation":
        state["generation"] = data.get("generation", "default")
    elif action == "set_mode":
        state["mode"] = data.get("mode", "")
        state["counter"] = 0
        state["shiny"] = False
        state["name"] = ""
        state["generation"] = "default"
        #state["image_url"] = ""
    elif action == "toggle_shiny" and state["mode"] == "pokemon":
        state["shiny"] = not state["shiny"]
        #state["image_url"] = fetch_pokemon(state["name"], shiny=state["shiny"])
    elif action == "set_name":
        state["name"] = data.get("name", "")
        
    notify_clients()
    return jsonify(success=True,state=state)

@app.route("/stream")
def stream():
    def event_stream():
        q = Queue()
        subscribers.append(q)
        # send initial state med det samme
        q.put(json.dumps(state))
        try:
            while True:
                data = q.get()
                yield f"data: {data}\n\n"
        except GeneratorExit:
            subscribers.remove(q)

    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    #state["image_url"] = fetch_pokemon(state["name"], shiny=state["shiny"])
    app.run(host="0.0.0.0", port=5000, debug=True)
        