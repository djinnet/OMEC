import { CreatureProvider } from "./baseProvider.js";

export class KindredFatesProvider extends CreatureProvider {
    constructor() {
        super("kindredfates", "Kindred Fates", true);
        this.API_URL = "https://www.kindredfateswiki.com/api.php";
    }

    async fetchJSON(params) {
        const url = new URL(this.API_URL);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        url.searchParams.append("origin", "*"); // CORS fix
        const response = await fetch(url);
        return await response.json();
    }

    async getCargoImages(name) {
        const cargoData = await this.fetchJSON({
            action: "cargoquery",
            tables: "Kinfolk",
            fields: "imageNormal,imagePhantom,imageVariant",
            where: `name="${name}"`,
            format: "json"
        });

        if (!cargoData.cargoquery || cargoData.cargoquery.length === 0) return null;
        return cargoData.cargoquery[0].title;
    }

    async getFileUrl(fileName) {
        if (!fileName) return null;
        const data = await this.fetchJSON({
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

            // Normal vises som standard
            let sprite = normalFile;

            // Brug phantom som "shiny"
            if (shiny && phantomFile) {
                sprite = phantomFile;
            }

            // variant kan evt. håndteres senere
            return sprite;
        } catch (err) {
            console.error("Fejl ved hentning af Kindred Fates billede:", err);
            return null;
        }
    }
}
