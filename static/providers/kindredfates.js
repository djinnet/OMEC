import { CreatureProvider } from "./baseProvider.js";
import { fetchJSON } from "./commonProvider.js";

/**
 * Provider for Kindred Fates creatures
 * @author Djinnet
 */
export class KindredFatesProvider extends CreatureProvider {
    constructor() {
        super("kindredfates", "Kindred Fates", true);
        this.API_URL = "https://www.kindredfateswiki.com/api.php";
    }

    /**
     * Get cargo images for a specific creature
     * @param {*} name - creature name
     * @returns {Promise<Object|null>} - cargo images or null if not found
     */
    async getCargoImages(name) {
        const cargoData = await fetchJSON(this.API_URL, {
            action: "cargoquery",
            tables: "Kinfolk",
            fields: "imageNormal,imagePhantom,imageVariant",
            where: `name="${name}"`,
            format: "json"
        });

        if (!cargoData.cargoquery || cargoData.cargoquery.length === 0) return null;
        return cargoData.cargoquery[0].title;
    }

    /**
     * Get the file URL for a specific image
     * @param {*} fileName - The name of the file
     * @returns {Promise<string|null>} - The file URL or null if not found
     */
    async getFileUrl(fileName) {
        if (!fileName) return null;
        const data = await fetchJSON(this.API_URL, {
            action: "query",
            titles: `File:${fileName}`,
            prop: "imageinfo",
            iiprop: "url",
            format: "json"
        });

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return pages[pageId].imageinfo ? pages[pageId].imageinfo[0].url : null;
    }

    async validate(name) {
        const images = await this.getCargoImages(name);
        return images ? true : false;
    }

    async getSprite(name, { shiny = false } = {}) {
        try {
            const cargoImages = await this.getCargoImages(name);
            if (!cargoImages) return null;

            const [normalFile, phantomFile, variantFile] = await Promise.all([
                this.getFileUrl(cargoImages.imageNormal),
                this.getFileUrl(cargoImages.imagePhantom),
                this.getFileUrl(cargoImages.imageVariant)
            ]);

            // Normal sprite shows as standard
            let sprite = normalFile;

            // Use phantom as "shiny"
            if (shiny && phantomFile) {
                sprite = phantomFile;
            }

            // variant can be handled later
            return sprite;
        } catch (err) {
            console.error("Error fetching Kindred Fates image:", err);
            return null;
        }
    }
}
