/**
 * Base class for creature providers
 * (e.g., Pokemon, Digimon, etc.)
 * @author Djinnet
 */
export class CreatureProvider {
    /**
     * @param {*} mode - creature mode
     * @param {*} label - creature label
     * @param {*} enabled - creature enabled status
     */
    constructor(mode, label = null, enabled = true) {
        this.mode = mode;
        this.label = label || mode;
        this.enabled = enabled;
    }

    /**
     * Validate the creature name
     * @param {*} name - creature name
     */
    async validate(name) {
        throw new Error("Method 'validate()' must be implemented.");
    }

    /**
     * Get the sprite for a specific creature
     * @param {*} name - creature name
     * @param {*} options - additional options for fetching the sprite
     */
    async getSprite(name, options = {}) {
        throw new Error("Method 'getSprite()' must be implemented.");
    }
}