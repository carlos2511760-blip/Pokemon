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
  // --- Projeto Aurora Starters ---
  81: {
    id: 81,
    name: 'Magnemite',
    types: ['electric', 'steel'],
    baseStats: { hp: 25, attack: 35, defense: 70, speed: 45 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'thunderShock' },
      { level: 7, moveId: 'metalSound' },
      { level: 11, moveId: 'spark' },
      { level: 15, moveId: 'flashCannon' },
      { level: 21, moveId: 'thunderbolt' },
    ],
    spriteId: 81,
    catchRate: 190,
  },

  46: {
    id: 46,
    name: 'Paras',
    types: ['bug', 'grass'],
    baseStats: { hp: 35, attack: 70, defense: 55, speed: 25 },
    learnset: [
      { level: 1, moveId: 'scratch' },
      { level: 1, moveId: 'absorb' },
      { level: 6, moveId: 'stunSpore' },
      { level: 11, moveId: 'bugBite' },
      { level: 17, moveId: 'spore' },
      { level: 22, moveId: 'leechLife' },
    ],
    spriteId: 46,
    catchRate: 190,
  },

  258: {
    id: 258,
    name: 'Mudkip',
    types: ['water'],
    baseStats: { hp: 50, attack: 70, defense: 50, speed: 40 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 1, moveId: 'waterGun' },
      { level: 6, moveId: 'mudSlap' },
      { level: 10, moveId: 'bite' },
      { level: 15, moveId: 'mudShot' },
      { level: 20, moveId: 'earthquake' },
    ],
    spriteId: 258,
    catchRate: 45,
  },

  // --- Wild Pokemon for Facility ---
  41: {
    id: 41,
    name: 'Zubat',
    types: ['poison', 'flying'],
    baseStats: { hp: 40, attack: 45, defense: 35, speed: 55 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 5, moveId: 'bite' },
      { level: 11, moveId: 'gust' },
    ],
    spriteId: 41,
    catchRate: 255,
  },

  74: {
    id: 74,
    name: 'Geodude',
    types: ['rock', 'ground'],
    baseStats: { hp: 40, attack: 80, defense: 100, speed: 20 },
    learnset: [
      { level: 1, moveId: 'tackle' },
      { level: 6, moveId: 'mudSlap' },
      { level: 11, moveId: 'mudShot' },
    ],
    spriteId: 74,
    catchRate: 255,
  },
};

export default POKEDEX;
