export const APP_VERSION = "0.1.0";
export const LAST_SEEN_VERSION_KEY = "lastSeenVersion";

/**
 * Features list for each version
 * Add new features when version updates
 */
export const VERSION_FEATURES = {
    "0.1.0": [
        {
            titleKey: "whatsNew.update1Title",
            descriptionKey: "whatsNew.update1Description",
        },
        {
            titleKey: "whatsNew.update2Title",
            descriptionKey: "whatsNew.update2Description",
        },
        {
            titleKey: "whatsNew.update3Title",
            descriptionKey: "whatsNew.update3Description",
        },
    ],
};

/**
 * Get the last seen version from storage
 * Uses chrome.storage in extension mode, localStorage in development
 */
export const getLastSeenVersion = async (): Promise<string | null> => {
    // Try chrome.storage first (extension mode)
    if (typeof chrome !== "undefined" && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(LAST_SEEN_VERSION_KEY);
            return result[LAST_SEEN_VERSION_KEY] || null;
        } catch (error) {
            console.error("Error reading version from chrome.storage:", error);
        }
    }

    // Fallback to localStorage (development mode)
    return localStorage.getItem(LAST_SEEN_VERSION_KEY);
};

/**
 * Save the last seen version to storage
 * Uses chrome.storage in extension mode, localStorage in development
 */
export const setLastSeenVersion = async (version: string): Promise<void> => {
    // Save to localStorage (for development mode)
    localStorage.setItem(LAST_SEEN_VERSION_KEY, version);

    // Also save to chrome.storage (for extension mode)
    if (typeof chrome !== "undefined" && chrome.storage) {
        try {
            await chrome.storage.local.set({ [LAST_SEEN_VERSION_KEY]: version });
        } catch (error) {
            console.error("Error saving version to chrome.storage:", error);
        }
    }
};

/**
 * Check if there are new updates to show
 * Returns true if user hasn't seen the current version
 */
export const hasNewUpdates = async (): Promise<boolean> => {
    const lastSeenVersion = await getLastSeenVersion();
    return lastSeenVersion !== APP_VERSION;
};

/**
 * Get features for the current version
 */
export const getCurrentVersionFeatures = () => {
    return VERSION_FEATURES[APP_VERSION as keyof typeof VERSION_FEATURES] || [];
};
