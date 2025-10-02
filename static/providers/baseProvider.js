export class CreatureProvider {
    constructor(mode, label = null, enabled = true) {
        this.mode = mode;
        this.label = label || mode;
        this.enabled = enabled;
    }

    async validate(name) {
        throw new Error("Method 'validate()' must be implemented.");
    }

    async getSprite(name, options = {}) {
        throw new Error("Method 'getSprite()' must be implemented.");
    }
}