import { PokemonProvider } from "./providers/pokemon.js";
import { DigimonProvider } from "./providers/digimon.js";
import { TemtemProvider } from "./providers/temtem.js";
import { CoromonProvider } from "./providers/coromon.js";
import { KindredFatesProvider } from "./providers/kindredfates.js";
import { loadNames, sendName, sendMode, sendGeneration, sendAction } from "./common.js";

const providers = {
    pokemon: new PokemonProvider(),
    digimon: new DigimonProvider(),
    temtem: new TemtemProvider(),
    coromon: new CoromonProvider(),
    kindredfates: new KindredFatesProvider(),
    // monstercrown: new MonsterCrownProvider()
};

function getProvider(mode) {
    return providers[mode] || null;
}

async function nameValidate(name, mode) {
    try {
        console.log("Validerer navn:", name, "i mode:", mode);
        const provider = getProvider(mode);
        if (!provider) {
            alert(`Ukendt mode: ${mode}`);
            return false;
        }
        return await provider.validate(name);
    } catch (error) {
        alert("Der opstod en fejl ved validering af navnet.");
        return false;
    }
}

async function loadSprite(name, mode, options = {}) {
    const provider = getProvider(mode);
    if (!provider) return null;
    return await provider.getSprite(name, options);
}

async function setName() {
    const name = document.getElementById("name").value;
    if (!name) return;

    // valider navn via pokeapi/digimon api
    const mode = window.currentMode || "pokemon"; // antag pokemon som default
    await nameValidate(name, mode).then(isValid => {
        if (isValid) {
            sendName(name);
        }
    });
}

async function setMode() {
  const mode = document.getElementById("mode").value;
  window.currentMode = mode; // opdater globalt
  console.log("Skifter mode til:", mode);
  sendMode(mode);
  await loadNames(); // genindlæs navne for den nye mode

  // reset navn input
  const nameInput = document.getElementById("name");
  if (nameInput) nameInput.value = "";

  await sendAction("reset"); // reset counter ved modeskift
}


function setGeneration() {
  const gen = document.getElementById("generation").value;
  sendGeneration(gen);
}

// Only for Pokemon: load generations dynamically
async function loadGenerations(pokemonName, selectedGen, shiny) {
    if(mode !== "pokemon") return; // only for Pokemon

    const select = document.getElementById("generation");
    if (!select) return;
    select.innerHTML = ""; // ryd dropdown

    // Tilføj default option
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

    for (const genKey of Object.keys(versions)) {
        const opt = document.createElement("option");
        opt.value = genKey;
        opt.textContent = genKey.replace("generation-", "Gen ").toUpperCase();
        select.appendChild(opt);
    }

    // vælg den nuværende generation
    select.value = selectedGen || "default";

    } catch (err) {
    console.warn(`Kunne ikke hente generations info for ${pokemonName}`, err);
    }
}

// Håndter visning af shiny knap og generation dropdown baseret på mode
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
        // hent generationer dynamisk
        if (data.name) {
            await loadGenerations(data.name, data.generation, data.shiny);
        }
    }
  } else {
    if (btnShiny) btnShiny.style.display = "none";
    if (genBox) genBox.style.display = "none";
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  populateModeOptions();

  document.getElementById("generation").addEventListener("change", setGeneration);
  document.getElementById("name-form").addEventListener("submit", async (e) => { e.preventDefault(); await setName(); });

  document.getElementById("btn-inc").addEventListener("click", () => sendAction("inc"));
  document.getElementById("btn-dec").addEventListener("click", () => sendAction("dec"));
  document.getElementById("btn-reset").addEventListener("click", () => sendAction("reset"));
  document.getElementById("btn-shiny").addEventListener("click", () => sendAction("toggle_shiny"));
});

// Lyt på server events
const evtSource = new EventSource("/stream");
evtSource.onmessage = async function(event) {
  const data = JSON.parse(event.data);
  
  console.log("Modtaget data fra server:", data);
    // Gem nuværende mode globalt
  window.currentMode = data.mode;

  const counterDiv = document.querySelector(".counter");
  if (!counterDiv) return;
  // Counter
  counterDiv.innerText = data.counter;

  // Opdater kontroller baseret på mode
  await updateControlsForMode(data);

  // navneliste
  await loadNames();

  // preview billede (samme logik som før)
  const spritePreview = document.getElementById("sprite-preview") || document.getElementById("sprite");
  if (!spritePreview) return;

  console.log("Loader sprite for mode:", data.mode, "navn:", data.name);
  const spriteUrl = await loadSprite(data.name, data.mode, { shiny: data.shiny, generation: data.generation });

  spritePreview.src = spriteUrl || "";
};



// Loader navne når siden starter
/* window.onload = async function() {
  await loadNames();
}; */
