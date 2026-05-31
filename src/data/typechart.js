/**
 * typechart.js
 * Pokemon type effectiveness chart.
 * Each key is an attacking type, and the value is an object mapping
 * defending types to their effectiveness multiplier.
 * Only non-1.0 matchups are listed; missing entries default to 1.0.
 */

export const TYPE_CHART = {
  normal: {
    rock: 0.5,
    ghost: 0,
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
  },
  electric: {
    water: 2,
    grass: 0.5,
    electric: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
  },
  dragon: {
    dragon: 2,
  },
};

/**
 * Calculate the combined type effectiveness multiplier.
 * @param {string} attackType - The type of the attacking move (e.g. 'fire').
 * @param {string[]} defendTypes - Array of the defender's types (e.g. ['grass', 'poison']).
 * @returns {number} Combined multiplier (e.g. 4, 2, 1, 0.5, 0.25, or 0).
 */
export function getEffectiveness(attackType, defendTypes) {
  const chart = TYPE_CHART[attackType];

  // If the attack type isn't in the chart, treat everything as neutral
  if (!chart) return 1;

  let multiplier = 1;

  for (const defType of defendTypes) {
    // Look up this specific matchup; default to 1 (neutral) if not listed
    const effectiveness = chart[defType] !== undefined ? chart[defType] : 1;
    multiplier *= effectiveness;
  }

  return multiplier;
}

export default TYPE_CHART;
