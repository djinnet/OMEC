import { CreatureProvider } from "./baseProvider.js";

export class PalworldProvider extends CreatureProvider {
    constructor() {
        super("palworld", "Palworld", true);
        this.API_URL = "https://palworld.wiki.gg/api.php";
    }

    async fetchJSON(params) {
        const url = new URL(this.API_URL);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        url.searchParams.append("origin", "*"); // CORS fix
        const response = await fetch(url);
        return await response.json();
    }

    async validate(name) {
        if (!name) return false;
        const json = await this.fetchJSON({
            action: "parse",
            format: "json",
            page: name,
            prop: "properties|parsewarnings",
            formatversion: 2
        });
        return json.parse?.properties?.thumb ? true : false;
    }

    async getSprite(name) {
        if (!name) return null;
        const json = await this.fetchJSON({
            action: "parse",
            format: "json",
            page: name,
            prop: "properties|parsewarnings",
            formatversion: 2
        });
        if (json.parse?.properties?.thumb) {
            return `https://palworld.wiki.gg/images/${json.parse.properties.thumb}`;
        }
        return null;
    }
}
