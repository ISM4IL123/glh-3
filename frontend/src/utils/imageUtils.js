const nameToImageMap = {
  "Beef Ribs": "Beefribs.jpg",
  "Dates": "Dates (Premium).jpg"
};

const getImagePath = (name, customImage = null) => {
  if (customImage) {
    return new URL(`../assets/images/${customImage}`, import.meta.url).href;
  }

  if (nameToImageMap[name]) {
    return new URL(`../assets/images/${nameToImageMap[name]}`, import.meta.url).href;
  }

  let normalized = name
    .replace(/\s*\([^)]*\)\s*/g, '')  // Strip (phrases) first
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')  // Keep letters, digits, spaces, hyphens
    .replace(/\s{2,}/g, ' ')          // Collapse multiple spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ');  // Ensure single spaces

  return new URL(`../assets/images/${normalized}.jpg`, import.meta.url).href;
};

export { getImagePath };

