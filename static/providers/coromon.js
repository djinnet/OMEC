import { CreatureProvider } from "./baseProvider.js";
import { validateThumbnail, fetchJSON } from "./commonProvider.js";

/**
 * Provider for Coromon creatures
 * @author Djinnet
 */
export class CoromonProvider extends CreatureProvider {
    constructor() {
        super("coromon", "Coromon", true);
        this.API_URL = "https://coromon.wiki.gg/api.php";
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
        const thumb = json.parse?.properties?.thumb;
        if (validateThumbnail(thumb)) {
            return `https://coromon.wiki.gg/images/${thumb}`;
        }
        return null;
    }
}
