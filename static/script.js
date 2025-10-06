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
  const genBox = document.getElementById("generation-box");
  if (data.mode === "pokemon") {
    if(btnShiny){
        btnShiny.style.display = "inline-block";
        btnShiny.innerText = `Toggle Shiny (${data.shiny ? "On" : "Off"})`;
    }
    
    if(genBox){
        genBox.style.display = "block";
        // fetch generations dynamically
        if (data.name) {
            await loadGenerations(data.name, data.generation, data.mode);
        }
    }
  } else {
    if (btnShiny) btnShiny.style.display = "none";
    if (genBox) genBox.style.display = "none";
  }
}

/**
 * Populate mode options in the dropdown
 * @returns {void}
 */
function populateModeOptions() {
    const modeSelect = document.getElementById("mode");
    if (!modeSelect) return;

    Object.keys(providers)
    .filter(modeKey => providers[modeKey].enabled)
    .forEach(modeKey => {
        const provider = providers[modeKey];
        const option = document.createElement("option");
        option.value = modeKey;
        option.textContent = provider.label || modeKey;
        modeSelect.appendChild(option);
    });

    modeSelect.value = window.currentMode || "pokemon";

    modeSelect.addEventListener("change", setMode);
}

// Initialize event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  populateModeOptions();

  document.getElementById("generation").addEventListener("change", setGeneration);
  document.getElementById("name-form").addEventListener("submit", async (e) => { e.preventDefault(); await setName(); });

  document.getElementById("btn-inc").addEventListener("click", () => sendAction("inc"));
  document.getElementById("btn-dec").addEventListener("click", () => sendAction("dec"));
  document.getElementById("btn-reset").addEventListener("click", () => sendAction("reset"));
  document.getElementById("btn-shiny").addEventListener("click", () => sendAction("toggle_shiny"));
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
