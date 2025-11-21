/**
 * Wrapper for chrome.storage.local to handle presets.
 */

const STORAGE_KEY = 'x_ray_presets';

/**
 * Get all saved presets.
 * @returns {Promise<Array>} List of presets
 */
export const getPresets = async () => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('chrome.storage is not available (dev mode?)');
        return [];
    }

    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || [];
};

/**
 * Save a new preset.
 * @param {Object} preset - The preset object to save
 * @param {string} preset.name - Name of the preset
 * @param {Object} preset.data - The form data
 */
export const savePreset = async (preset) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const current = await getPresets();
    const updated = [...current, { ...preset, id: Date.now() }];

    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
    return updated;
};

/**
 * Delete a preset by ID.
 * @param {number} id - The ID of the preset to delete
 */
export const deletePreset = async (id) => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const current = await getPresets();
    const updated = current.filter(p => p.id !== id);

    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
    return updated;
};
