import { CreatureProvider } from "./baseProvider.js";

export class TemtemProvider extends CreatureProvider {
    constructor() {
        super("temtem", "Temtem", true);
    }

    async validate(name) {
        const res = await fetch("https://temtem-api.mael.tech/api/temtems");
        const list = await res.json();
        return list.some(t => t.name.toLowerCase() === name.toLowerCase());
    }

    async getSprite(name) {
        const res = await fetch("https://temtem-api.mael.tech/api/temtems");
        const list = await res.json();
        const t = list.find(t => t.name.toLowerCase() === name.toLowerCase());
        return t?.portraitWikiUrl || null;
    }
}
