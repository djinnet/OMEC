import { CreatureProvider } from "./baseProvider.js";

export class DigimonProvider extends CreatureProvider {
    constructor() {
        super("digimon", "Digimon", true);
    }

    async validate(name) {
        if (!name) return false;
        const res = await fetch("https://digimon-api.vercel.app/api/digimon/name/" + name);
        return res.ok;
    }

    async getSprite(name) {
        if (!name) return null;
        const res = await fetch("https://digimon-api.vercel.app/api/digimon/name/" + name);
        if (!res.ok) return null;
        const data = await res.json();
        return data[0]?.img || null;
    }
}
