import Pokemon from '../entities/Pokemon.js';
import { GlobalEventBus } from './GlobalEventBus.js';
import { GameEvents } from './GameEvents.js';

/**
 * GameState.js
 * 
 * Central repository for all dynamic player session state.
 * This class contains the player's Pokemon party, inventory, 
 * current location, and any story progression flags.
 * 
 * It registers itself with the SaveService for persistence.
 */
export default class GameState {
  constructor() {
    /** @type {Pokemon[]} */
    this.playerParty = [];
    
    /** @type {object} */
    this.inventory = {
      pokeBalls: 5,
      potions: 5,
      money: 3000
    };

    /** @type {object} */
    this.location = {
      scene: 'WorldScene',
      x: 5, // Default spawn in Pallet Town
      y: 9,
      facing: 'down'
    };

    /** @type {object} */
    this.flags = {}; // Story progress flags
  }

  /**
   * Initializes a new game state.
   */
  newGame() {
    this.playerParty = [
      new Pokemon(4, 5) // Charmander Lv 5
    ];
    this.inventory = { pokeBalls: 5, potions: 5, money: 3000 };
    this.location = { scene: 'WorldScene', x: 5, y: 9, facing: 'down' };
    this.flags = { gameStarted: true };
    console.log('[GameState] New game initialized.');
  }

  /**
   * Heals the entire party.
   */
  healParty() {
    for (const p of this.playerParty) {
      p.heal(p.maxHp);
      p.clearStatus();
      for (const m of p.moves) m.currentPp = m.pp;
    }
  }

  /**
   * Serializes the entire game state into a plain object.
   * @returns {object}
   */
  serialize() {
    return {
      playerParty: this.playerParty.map(p => p.serialize()),
      inventory: { ...this.inventory },
      location: { ...this.location },
      flags: { ...this.flags }
    };
  }

  /**
   * Deserializes game state from a plain object.
   * @param {object} data
   */
  deserialize(data) {
    if (!data) return;
    
    this.playerParty = (data.playerParty || []).map(pData => Pokemon.deserialize(pData));
    this.inventory = { ...this.inventory, ...(data.inventory || {}) };
    this.location = { ...this.location, ...(data.location || {}) };
    this.flags = { ...this.flags, ...(data.flags || {}) };
    
    console.log('[GameState] State deserialized.');
  }
}
