/**
 * pokedex.js
 * Pokemon species data keyed by national Pokedex number.
 * Each entry contains: id, name, types, baseStats, learnset, and spriteId.
 * spriteId matches the PokeAPI sprite number (same as national dex number).
 */

export const POKEDEX = {
  1: {
    id: 1,
    name: 'Bulbasaur',
    types: ['grass', 'poison'],
    baseStats: { hp: 45, attack: 49, defense: 49, speed: 45 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 7, moveId: 'vineWhip' },
      { level: 13, moveId: 'razorLeaf' },
      { level: 20, moveId: 'seedBomb' },
    ],
    spriteId: 1,
  },

  4: {
    id: 4,
    name: 'Charmander',
    types: ['fire'],
    baseStats: { hp: 39, attack: 52, defense: 43, speed: 65 },
    learnset: [
      { level: 1, moveId: 'scratch' },
      { level: 7, moveId: 'ember' },
      { level: 13, moveId: 'fireFang' },
      { level: 20, moveId: 'flamethrower' },
    ],
    spriteId: 4,
  },

  7: {
    id: 7,
    name: 'Squirtle',
    types: ['water'],
    baseStats: { hp: 44, attack: 48, defense: 65, speed: 43 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 7, moveId: 'waterGun' },
      { level: 13, moveId: 'bite' },
      { level: 20, moveId: 'hydroPump' },
    ],
    spriteId: 7,
  },

  16: {
    id: 16,
    name: 'Pidgey',
    types: ['normal', 'flying'],
    baseStats: { hp: 40, attack: 45, defense: 40, speed: 56 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 9, moveId: 'gust' },
      { level: 13, moveId: 'quickAttack' },
    ],
    spriteId: 16,
  },

  19: {
    id: 19,
    name: 'Rattata',
    types: ['normal'],
    baseStats: { hp: 30, attack: 56, defense: 35, speed: 72 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 7, moveId: 'quickAttack' },
      { level: 13, moveId: 'bite' },
    ],
    spriteId: 19,
  },

  25: {
    id: 25,
    name: 'Pikachu',
    types: ['electric'],
    baseStats: { hp: 35, attack: 55, defense: 40, speed: 90 },
    learnset: [
      { level: 1, moveId: 'thunderShock' },
      { level: 7, moveId: 'quickAttack' },
      { level: 13, moveId: 'spark' },
      { level: 20, moveId: 'thunderbolt' },
    ],
    spriteId: 25,
  },
};

export default POKEDEX;
