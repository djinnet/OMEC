// Common utility functions for providers
// (e.g., validation, fetching JSON data, etc.)

/**
 * Validate the thumbnail filename
 * @param {*} thumb - thumbnail filename
 * @returns {boolean} - true if valid, false otherwise
 */
export function validateThumbnail(thumb) {
    if (!thumb) return false;
    // Simple validation to avoid directory traversal or invalid characters
    // Allow only alphanumeric, underscores, hyphens, and dots
    return /^[\w\-\.]+$/.test(thumb);
}

/**
 * Validate a URL
 * @param {*} url 
 * @returns {boolean} - true if valid, false otherwise
 */
export function validateURL(url) {
    if (!url) return false;
    try {
        const parsedURL = new URL(url);
        return parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
    } catch (e) {
        return false;
    }
}

/**
 * Fetch JSON data from a REST API endpoint
 * @param {*} API_URL - The API endpoint URL
 * @param {*} params - Query parameters for the request
 * @returns {Promise<Object|null>} - The JSON response or null if an error occurred
 */
export async function fetchJSON(API_URL, params) {
    const url = new URL(API_URL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    url.searchParams.append("origin", "*"); // CORS fix
     try {
        const response = await fetch(url);
        if (!response.ok) {
            // Optionally log the error or throw
            // throw new Error(`HTTP error! status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (err) {
        // Optionally log the error
        // console.error("Fetch or JSON parse error:", err);
        return null;
    }
}