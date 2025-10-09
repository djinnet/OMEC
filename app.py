from flask import Flask, render_template, request, jsonify, Response
import requests
import json
from queue import Queue
import provider_manager
import fetch_names_manager

app = Flask(__name__)

state = {
    "counter": 0,
    "mode": "pokemon", # can be "pokemon", "digimon", "temtem", etc.
    "shiny": False,
    "name":"pikachu", # default pokemon
    "generation": "default"
}

subscribers = []  # active clients for SSE

def notify_clients():
    data = json.dumps(state)
    for sub in subscribers[:]:
        try:
            sub.put(data)
        except:
            subscribers.remove(sub)

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
        names = fetch_names_manager.FetchNamesManager.fetch_names(mode)
        return jsonify(names)
    except Exception as e:
        print(f"Error fetching names for mode {mode}: {e}")
        return jsonify([])

@app.route("/api/providers", methods=['GET'])
def get_providers():
    settings = provider_manager.ProviderManager.load_provider_settings()
    return jsonify(settings)

@app.route("/api/providers", methods=['POST'])
def save_providers():
    try:
        data = request.get_json()
        provider_manager.ProviderManager.save_provider_settings(data)
        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"Error saving provider settings: {e}")
        return jsonify({"status": "error", "message": str(e)}, 500)


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
    elif action == "toggle_shiny" and state["mode"] == "pokemon":
        state["shiny"] = not state["shiny"]
    elif action == "set_name":
        state["name"] = data.get("name", "")
        
    notify_clients()
    return jsonify(success=True,state=state)

@app.route("/stream")
def stream():
    def event_stream():
        q = Queue()
        subscribers.append(q)
        q.put(json.dumps(state))
        try:
            while True:
                data = q.get()
                yield f"data: {data}\n\n"
        except GeneratorExit:
            subscribers.remove(q)

    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
        