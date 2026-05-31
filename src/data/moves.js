/**
 * moves.js
 * All move definitions keyed by moveId.
 * Each move has: name, type, category (physical/special), power, accuracy, pp.
 */

export const MOVES = {
  // --- Normal-type moves ---
  tackle: {
    name: 'Tackle',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
  },
  scratch: {
    name: 'Scratch',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 35,
  },
  quickAttack: {
    name: 'Quick Attack',
    type: 'normal',
    category: 'physical',
    power: 40,
    accuracy: 100,
    pp: 30,
  },
  bite: {
    name: 'Bite',
    type: 'normal',
    category: 'physical',
    power: 60,
    accuracy: 100,
    pp: 25,
  },

  // --- Flying-type moves ---
  gust: {
    name: 'Gust',
    type: 'flying',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 35,
  },

  // --- Fire-type moves ---
  ember: {
    name: 'Ember',
    type: 'fire',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
  },
  fireFang: {
    name: 'Fire Fang',
    type: 'fire',
    category: 'physical',
    power: 65,
    accuracy: 95,
    pp: 15,
  },
  flamethrower: {
    name: 'Flamethrower',
    type: 'fire',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 15,
  },

  // --- Water-type moves ---
  waterGun: {
    name: 'Water Gun',
    type: 'water',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 25,
  },
  hydroPump: {
    name: 'Hydro Pump',
    type: 'water',
    category: 'special',
    power: 110,
    accuracy: 80,
    pp: 5,
  },

  // --- Grass-type moves ---
  vineWhip: {
    name: 'Vine Whip',
    type: 'grass',
    category: 'physical',
    power: 45,
    accuracy: 100,
    pp: 25,
  },
  razorLeaf: {
    name: 'Razor Leaf',
    type: 'grass',
    category: 'physical',
    power: 55,
    accuracy: 95,
    pp: 25,
  },
  seedBomb: {
    name: 'Seed Bomb',
    type: 'grass',
    category: 'physical',
    power: 80,
    accuracy: 100,
    pp: 15,
  },

  // --- Electric-type moves ---
  thunderShock: {
    name: 'Thunder Shock',
    type: 'electric',
    category: 'special',
    power: 40,
    accuracy: 100,
    pp: 30,
  },
  spark: {
    name: 'Spark',
    type: 'electric',
    category: 'physical',
    power: 65,
    accuracy: 100,
    pp: 20,
  },
  thunderbolt: {
    name: 'Thunderbolt',
    type: 'electric',
    category: 'special',
    power: 90,
    accuracy: 100,
    pp: 15,
  },
};

export default MOVES;
