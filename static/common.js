// Common functions for frontend
// (e.g., sending actions to server, loading names for autocomplete, etc.)

/**
 * Send an action to the server
 * @param {*} action - action string (e.g., "inc", "dec", "reset")
 */
export function sendAction(action) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
}

/**
 * Send the entered name to the server
 * @param {*} name - creature name
 */
export function sendName(name) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_name", name })});
}

/**
 * Send the selected mode to the server
 * @param {*} mode - mode string (e.g., "pokemon", "digimon", "palworld")
 */
export function sendMode(mode) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_mode", mode }) });
}

/**
 * Send the selected generation to the server
 * @param {*} gen - generation (string or number)
 */
export function sendGeneration(gen) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_generation", generation: gen }) });
}

export function setImageScale(scale) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set_scale', scale: parseFloat(scale) }) });
}

/**
 * Fetch and populate the name list for the current mode
 */
export async function loadNames() {
  try {
        // Fetch name list from server for the current mode
        const res = await fetch("/names");
        if (!res.ok) throw new Error("Could not fetch names from server");
        const names = await res.json();

        const datalist = document.getElementById("name-list");
        datalist.innerHTML = ""; // clear existing options

        names.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            datalist.appendChild(option);
        });

        // Save in currentAutocomplete so we can use it for validation later
        window.currentAutocomplete = names;

    } catch (err) {
        console.error("Error fetching names:", err);
    }
}



