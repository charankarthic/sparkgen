/**
 * Calculate user level based on XP points
 * The formula uses a progressive scaling where each level requires more XP
 * @param {number} xp - The user's current XP points
 * @returns {number} - The calculated level
 */
const calculateLevel = (xp) => {
  // Base XP required for level 1
  const baseXp = 100;
  // Scaling factor for higher levels (increases XP required per level)
  const scalingFactor = 1.5;

  if (xp < baseXp) return 1;

  // Calculate level using a logarithmic formula
  const level = Math.floor(1 + Math.log(xp / baseXp) / Math.log(scalingFactor));
  return level;
};

/**
 * Calculate XP required for a specific level
 * @param {number} level - The target level
 * @returns {number} - XP required to reach this level
 */
const xpRequiredForLevel = (level) => {
  if (level <= 1) return 0;

  const baseXp = 100;
  const scalingFactor = 1.5;

  return Math.floor(baseXp * Math.pow(scalingFactor, level - 1));
};

module.exports = {
  calculateLevel,
  xpRequiredForLevel
};