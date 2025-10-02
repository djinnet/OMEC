import { CreatureProvider } from "./baseProvider.js";

export class PokemonProvider extends CreatureProvider {
    constructor() {
        super("pokemon", "Pokémon", true);
    }

    async validate(name) {
        if (!name) return false;
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
            return res.ok;
        } catch {
            return false;
        }
    }

    async getSprite(name, { shiny = false, generation = "default" } = {}) {
        if (!name) return null;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!res.ok) return null;
        const data = await res.json();

        const id = data.id;
        if (shiny) {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`;
        }
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
    }
}