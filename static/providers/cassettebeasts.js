import { CreatureProvider } from "./baseProvider.js";
import { validateURL, fetchJSON } from "./commonProvider.js";

/**
 * Provider for Cassette Beasts creatures
 * @author Djinnet
 */
export class CassetteBeastsProvider extends CreatureProvider {
    constructor() {
        super("cassettebeasts", "Cassette Beasts", true);
        this.API_URL = "https://wiki.cassettebeasts.com/api.php";
    }

    //TODO: optimize this to avoid fetching the entire species list each time
    async validate(name) {
        if (!name) return false;
        const json = await fetchJSON(this.API_URL, {
            action: "parse",
            format: "json",
            page: "Data:Species",
            prop: "wikitext",
            formatversion: 2
        });
        const raw_json = json?.parse?.wikitext;
        if (!raw_json) return false;
        const species_data = JSON.parse(raw_json);
        const names = species_data.map(s => s.name);
        //check if name exists in species_data
        if (names.includes(name)) return true;
        return false;

    }

    async getSprite(name) {
        if (!name) return null;

        const images_json = await fetchJSON(this.API_URL, {
            action: "query",
            format: "json",
            titles: `File:${name}.png`,
            prop: "imageinfo",
            iiprop: "url",
            formatversion: 2
        });
        const file_url = images_json?.query?.pages[0]?.imageinfo?.[0]?.url;

        if (!validateURL(file_url)) return null;
        return file_url;
    }
}