/**
 * Central configuration for 3D model scaling and environments.
 * This ensures consistency between AR and Desktop Room Configurator.
 */

export const CATEGORY_SCALES = {
  sofa: 1.2,
  chair: 0.7,
  table: 1.0,
  decor: 0.3,
  office: 0.9,
  bed: 1.5,
  wardrobe: 1.3,
  lighting: 0.4,
  default: 1.0
};

export const CATEGORY_ROOMS = {
  sofa: 'living_room',
  chair: 'living_room',
  table: 'dining_room',
  office: 'office',
  bed: 'bedroom',
  wardrobe: 'bedroom',
  default: 'studio'
};

/**
 * Helper to get scale for a specific category
 * @param {string} category 
 * @returns {number}
 */
export const getCategoryScale = (category) => {
  const normalized = category?.toLowerCase().trim();
  return CATEGORY_SCALES[normalized] || CATEGORY_SCALES.default;
};

/**
 * Helper to get room environment for a specific category
 * @param {string} category 
 * @returns {string}
 */
export const getCategoryRoom = (category) => {
  const normalized = category?.toLowerCase().trim();
  return CATEGORY_ROOMS[normalized] || CATEGORY_ROOMS.default;
};
