export function sendAction(action) {
  fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
}

export function sendName(name) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_name", name })});
}

export function sendMode(mode) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_mode", mode }) });
}

export function sendGeneration(gen) {
    fetch('/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "set_generation", generation: gen }) });
}

export async function loadNames() {
  try {
        // Hent navneliste fra server for den aktuelle mode
        const res = await fetch("/names");
        if (!res.ok) throw new Error("Kunne ikke hente navne fra server");
        const names = await res.json();

        const datalist = document.getElementById("name-list");
        datalist.innerHTML = ""; // ryd tidligere options

        names.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            datalist.appendChild(option);
        });

        // Gem i currentAutocomplete så vi kan bruge den til validering evt.
        window.currentAutocomplete = names;

    } catch (err) {
        console.error("Fejl ved hentning af navne:", err);
    }
}

