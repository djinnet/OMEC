import { PokemonProvider } from "./providers/pokemon.js";
import { DigimonProvider } from "./providers/digimon.js";
import { TemtemProvider } from "./providers/temtem.js";
import { CoromonProvider } from "./providers/coromon.js";
import { KindredFatesProvider } from "./providers/kindredfates.js";
import { PalworldProvider } from "./providers/palworld.js";
import { loadNames, sendName, sendMode, sendGeneration, sendAction } from "./common.js";

// this contains all available providers (modes)
const providers = {
    pokemon: new PokemonProvider(),
    digimon: new DigimonProvider(),
    temtem: new TemtemProvider(),
    coromon: new CoromonProvider(),
    kindredfates: new KindredFatesProvider(),
    palworld: new PalworldProvider()
};

/**
 * Get the appropriate provider for the selected mode
 * @param {*} mode 
 * @returns 
 */
function getProvider(mode) {
    return providers[mode] || null;
}

/**
 * Validate the creature name for the selected mode
 * @param {*} name - creature name
 * @param {*} mode - mode string (e.g., "pokemon", "digimon", "temtem")
 * @returns {Promise<boolean>} - true if valid, false otherwise
 */
async function nameValidate(name, mode) {
    try {
        console.log("Checking:", name, "in mode:", mode);
        const provider = getProvider(mode);
        if (!provider) {
            alert(`Unknown mode: ${mode}`);
            return false;
        }
        return await provider.validate(name);
    } catch (error) {
        alert("An error occurred while validating the name.");
        return false;
    }
}

/**
 * Load the sprite for the specified creature
 * @param {*} name - creature name
 * @param {*} mode - mode string (e.g., "pokemon", "digimon", "temtem")
 * @param {*} options - additional options (e.g., shiny, generation)
 * @returns {Promise<string|null>} - URL of the sprite image or null if not found
 */
async function loadSprite(name, mode, options = {}) {
    const provider = getProvider(mode);
    if (!provider) return null;
    return await provider.getSprite(name, options);
}

/**
 * Set the creature name from the input field
 * @returns {Promise<void>}
 */
async function setName() {
    const name = document.getElementById("name").value;
    if (!name) return;

    // validate name via pokeapi/digimon api
    const mode = window.currentMode || "pokemon"; // assume pokemon as default
    await nameValidate(name, mode).then(isValid => {
        // if valid, send to server
        if (isValid) {
            sendName(name);
        }
    });
}

/**
 * Set the mode when the dropdown changes
 */
async function setMode() {
  const mode = document.getElementById("mode").value;
  window.currentMode = mode; // update global
  console.log("Switching mode to:", mode);
  sendMode(mode);
  await loadNames(); // reload names for the new mode

  // reset name input
  const nameInput = document.getElementById("name");
  if (nameInput) nameInput.value = "";

  sendAction("reset"); // reset counter on mode change
}

/**
 * Set the generation when the dropdown changes
 */
function setGeneration() {
  const gen = document.getElementById("generation").value;
  sendGeneration(gen);
}

// Only for Pokemon: load generations dynamically
/**
 * Load the generations for a specific Pokémon
 * @param {*} pokemonName - name of the Pokémon
 * @param {*} selectedGen - currently selected generation
 * @param {*} mode - current mode (e.g., "pokemon", "digimon")
 */
async function loadGenerations(pokemonName, selectedGen, mode) {
    // Only for Pokemon
    if(mode !== "pokemon") return;

    const select = document.getElementById("generation");
    if (!select) return;
    select.innerHTML = ""; // clear existing options

    // Add default option
    const defOpt = document.createElement("option");
    defOpt.value = "default";
    defOpt.textContent = "Default (Newest)";
    select.appendChild(defOpt);

    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const versions = data.sprites.versions;
        if (!versions) return;
        // Loop through version keys (generations)

        for (const genKey of Object.keys(versions)) {
            const opt = document.createElement("option");
            opt.value = genKey;
            opt.textContent = genKey.replace("generation-", "Gen ").toUpperCase();
            select.appendChild(opt);
        }

        // select the current generation
        select.value = selectedGen || "default";

    } catch (err) {
        console.warn(`Could not fetch generation info for ${pokemonName}`, err);
    }
}

/**
 * Update UI controls based on the current mode
 * @param {*} data - data object from server (contains mode, shiny status, etc.)
 */
async function updateControlsForMode(data) {
    // Shiny button
  const btnShiny = document.getElementById("btn-shiny");
  //const genBox = document.getElementById("generation-box");
  if (data.mode === "pokemon") {
    if(btnShiny){
        btnShiny.style.display = "inline-block";
        btnShiny.innerText = `Toggle Shiny (${data.shiny ? "On" : "Off"})`;
    }
    
    /* if(genBox){
        genBox.style.display = "block";
        // fetch generations dynamically
        if (data.name) {
            await loadGenerations(data.name, data.generation, data.mode);
        }
    } */
  } else {
    if (btnShiny) btnShiny.style.display = "none";
    //if (genBox) genBox.style.display = "none";
  }
}

/**
 * Validate server providers against local providers
 * @param {*} serverProviders 
 * @returns {boolean} - true if valid, false otherwise
 */
function validateProviders(serverProviders) {
    const localProviders = Object.keys(providers);
    return localProviders.every(provider => serverProviders[provider] !== undefined);
}

/**
 * Populate mode options in the dropdown
 * @returns {void}
 */
async function populateModeOptions() {
    const modeSelect = document.getElementById("mode");
    if (!modeSelect) return;

    const res = await fetch("/api/providers");
    const serverProviders = await res.json();

    modeSelect.innerHTML = ""; // clear existing options

    //validate serverProviders with local providers
    const isValid = validateProviders(serverProviders);
    if (!isValid) {
        alert("Provider configuration mismatch between server and client. Please check the server logs.");
        return;
    }

    // Populate mode options
    for (const [name, enabled] of Object.entries(serverProviders)) {
      if (enabled) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        modeSelect.appendChild(opt);
      }
    } 

    modeSelect.value = window.currentMode || "pokemon";

    modeSelect.addEventListener("change", setMode);
}

/**
 * Load provider settings from the server and populate the admin panel
 */
async function loadProviderSettings() {
  const res = await fetch("/api/providers");
  const providers = await res.json();
  const container = document.getElementById("providers-list");
  container.innerHTML = "";

  //validate serverProviders with local providers
  const isValid = validateProviders(providers);
  if (!isValid) {
    alert("Provider configuration mismatch between server and client. Please check the server logs.");
    return;
  }

  for (const [name, enabled] of Object.entries(providers)) {
    const div = document.createElement("div");
    div.className = "provider-item";
    div.innerHTML = `
      <label>
        <input type="checkbox" id="prov-${name}" ${enabled ? "checked" : ""}>
        ${name}
      </label>
    `;
    container.appendChild(div);
  }
}

async function syncProviderSettings() {
    try {
    const res = await fetch("/api/providers");
    const backendProviders = await res.json();
    const frontendList = Object.keys(providers);
    const backendList = Object.keys(backendProviders);

    const missing = frontendList.filter(p => !(p in backendProviders));
    const extra = backendList.filter(p => !(p in providers));

    if (!missing.length && !extra.length) {
      alert("✅ Providers are already in sync!");
      return;
    }

    const confirmSync = confirm(
      `The following differences were found:\n\n` +
      (missing.length ? `🟢 Missing in backend: ${missing.join(", ")}\n` : "") +
      (extra.length ? `🔴 Missing in frontend: ${extra.join(", ")}\n` : "") +
      `\nDo you want to synchronize them now?`
    );

    if (!confirmSync) return;

    const updated = { ...backendProviders };
    // Add missing providers with default disabled
    missing.forEach(name => {
      updated[name] = false;
    });

    // Remove extras that don’t exist in frontend
    extra.forEach(name => delete updated[name]);

    const saveRes = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    if (saveRes.ok) {
      alert("✅ Providers successfully synchronized!");
      await loadProviderSettings();
      await populateModeOptions();
    } else {
      alert("❌ Failed to sync providers on the server.");
    }

  } catch (err) {
    console.error("Sync error:", err);
    alert("⚠️ Error while syncing providers. Check console for details.");
  }
}

/**
 * Save provider settings to the server
 */
async function saveProviderSettings() {
  try {
    const checkboxes = document.querySelectorAll("#providers-list input[type=checkbox]");
    const newSettings = {};
    checkboxes.forEach(cb => {
        const name = cb.id.replace("prov-", "");
        newSettings[name] = cb.checked;
    });

    // ensured at least one provider is enabled
    if (!Object.values(newSettings).some(v => v)) {
        alert("At least one provider must be enabled.");
        return;
    }

    const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
    });

    if (res.ok) {
        alert("Provider settings saved!");
        await populateModeOptions(); // refresh mode options
    }else{
        const errorData = await res.json();
        // response is a json with error message {status: "error", message: "Error details"}
        alert(`Error saving provider settings: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Error saving provider settings:", error);
    alert("An error occurred while saving provider settings.");
  }
}

async function openAdminModal() {
  document.getElementById("admin-modal").style.display = "block";
  await loadProviderSettings();
}

function closeAdminModal() {
  document.getElementById("admin-modal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("admin-modal");
  if (event.target === modal) {
    closeAdminModal();
  }
};

// Initialize event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    await populateModeOptions();

    //document.getElementById("generation").addEventListener("change", setGeneration);
    document.getElementById("name-form").addEventListener("submit", async (e) => { e.preventDefault(); await setName(); });

    document.getElementById("btn-inc").addEventListener("click", () => sendAction("inc"));
    document.getElementById("btn-dec").addEventListener("click", () => sendAction("dec"));
    document.getElementById("btn-reset").addEventListener("click", () => sendAction("reset"));
    document.getElementById("btn-shiny").addEventListener("click", () => sendAction("toggle_shiny"));

    // Admin panel buttons
    document.getElementById("btn-save-providers").addEventListener("click", saveProviderSettings);
    document.getElementById("btn-sync-providers").addEventListener("click", syncProviderSettings);

    // Open/close admin modal
    document.getElementById("settings-btn").addEventListener("click", openAdminModal);
    document.querySelector("#admin-modal .close").addEventListener("click", closeAdminModal);

});

// Listen for server events
const evtSource = new EventSource("/stream");
evtSource.onmessage = async function(event) {
  const data = JSON.parse(event.data);

  console.log("Received data from server:", data);
    // Save current mode globally
  window.currentMode = data.mode;

  const counterDiv = document.querySelector(".counter");
  if (!counterDiv) return;
  // Counter
  counterDiv.innerText = data.counter;

  // Update controls based on mode
  await updateControlsForMode(data);

  // name list
  await loadNames();

  // preview image (same logic as before)
  const spritePreview = document.getElementById("sprite-preview") || document.getElementById("sprite");
  if (!spritePreview) return;

  console.log("Loading sprite for mode:", data.mode, "name:", data.name);
  const spriteUrl = await loadSprite(data.name, data.mode, { shiny: data.shiny, generation: data.generation });

  spritePreview.src = spriteUrl || "";
};



// Loader names when the page starts
/* window.onload = async function() {
  await loadNames();
}; */
