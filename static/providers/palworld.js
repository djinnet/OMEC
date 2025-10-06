import { CreatureProvider } from "./baseProvider.js";
import { fetchJSON, validateThumbnail } from "./commonProvider.js";

export class PalworldProvider extends CreatureProvider {
    constructor() {
        super("palworld", "Palworld", true);
        this.API_URL = "https://palworld.wiki.gg/api.php";
    }

    async validate(name) {
        if (!name) return false;
        const json = await fetchJSON(this.API_URL, {
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
        const json = await fetchJSON(this.API_URL, {
            action: "parse",
            format: "json",
            page: name,
            prop: "properties|parsewarnings",
            formatversion: 2
        });
        if (validateThumbnail(json.parse?.properties?.thumb)) {
            return `https://palworld.wiki.gg/images/${json.parse.properties.thumb}`;
        }
        return null;
    }
}
