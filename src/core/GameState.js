import Pokemon from '../entities/Pokemon.js';
import { GlobalEventBus } from './GlobalEventBus.js';
import { GameEvents } from './GameEvents.js';

/**
 * GameState.js
 * 
 * Central repository for all dynamic player session state.
 * Implements the GDD's structured flag system for narrative progression.
 * 
 * Architecture:
 *  - story_progression: Binary flags tracking narrative milestones
 *  - world_state: Dynamic world data (defeated trainers, opened chests)
 *  - playerParty: The live Pokemon[] party
 *  - inventory: Categorized item storage with limits
 *  - location: Current scene, tile position, and facing direction
 */
export default class GameState {
  constructor() {
    /** @type {Pokemon[]} */
    this.playerParty = [];
    
    /**
     * Categorized inventory with strict limits per the GDD.
     * @type {object}
     */
    this.inventory = {
      capture: {
        pokeBall: 5,
        greatBall: 0,
        ultraBall: 0,
      },
      healing: {
        potion: 3,
        superPotion: 0,
        fullRestore: 0,
      },
      tools: {
        escapeRope: 1,
      },
      money: 500, // Technician salary - modest start
    };

    /**
     * Current location tracker for scene persistence.
     * @type {object}
     */
    this.location = {
      scene: 'FacilityScene', // NEW GAME starts at the Facility (Cold Start)
      x: 10,
      y: 12,
      facing: 'up'
    };

    /**
     * GDD-specified narrative progression flags.
     * Structured as a tree for clean querying.
     * @type {object}
     */
    this.story_progression = {
      prologue_complete: false,
      received_starter_trio: false,
      sector_1_unlocked: false,
      sector_1_boss_defeated: false,
      sector_2_unlocked: false,
      sector_2_boss_defeated: false,
      sector_3_unlocked: false,
      sector_3_boss_defeated: false,
    };

    /**
     * Dynamic world state tracking.
     * @type {object}
     */
    this.world_state = {
      current_map_id: 'facility_sector_7',
      defeated_trainers_ids: [],
      opened_chests_ids: [],
      discovered_areas: ['facility_sector_7'],
    };
  }

  /**
   * Initializes a new game with the Projeto Aurora Cold Start.
   * The player starts with THREE corporate-issue utility creatures:
   *  - Magnemite (Electric/Steel) - Generator reactivation
   *  - Paras (Bug/Grass) - Status/Capture specialist
   *  - Mudkip (Water/Ground) - Defensive tank
   */
  newGame() {
    this.playerParty = [
      new Pokemon(81, 5),   // Magnemite Lv 5 - Electric/Steel utility
      new Pokemon(46, 5),   // Paras Lv 5 - Status specialist
      new Pokemon(258, 5),  // Mudkip Lv 5 - Defensive tank
    ];

    this.inventory = {
      capture: { pokeBall: 5, greatBall: 0, ultraBall: 0 },
      healing: { potion: 3, superPotion: 0, fullRestore: 0 },
      tools: { escapeRope: 1 },
      money: 500,
    };

    this.location = {
      scene: 'FacilityScene',
      x: 10,
      y: 12,
      facing: 'up'
    };

    this.story_progression = {
      prologue_complete: false,
      received_starter_trio: false,
      sector_1_unlocked: false,
      sector_1_boss_defeated: false,
      sector_2_unlocked: false,
      sector_2_boss_defeated: false,
      sector_3_unlocked: false,
      sector_3_boss_defeated: false,
    };

    this.world_state = {
      current_map_id: 'facility_sector_7',
      defeated_trainers_ids: [],
      opened_chests_ids: [],
      discovered_areas: ['facility_sector_7'],
    };

    console.log('[GameState] Projeto Aurora - New game initialized. Cold Start sequence.');
  }

  // ─── Flag Helpers ──────────────────────────────────────────────────────

  /**
   * Set a story progression flag.
   * @param {string} flag - Key in story_progression
   * @param {boolean} value
   */
  setFlag(flag, value = true) {
    if (flag in this.story_progression) {
      this.story_progression[flag] = value;
      console.log(`[GameState] Flag set: ${flag} = ${value}`);
    } else {
      console.warn(`[GameState] Unknown story flag: "${flag}"`);
    }
  }

  /**
   * Get a story progression flag.
   * @param {string} flag
   * @returns {boolean}
   */
  getFlag(flag) {
    return this.story_progression[flag] ?? false;
  }

  /**
   * Record a defeated trainer.
   * @param {number|string} trainerId
   */
  defeatTrainer(trainerId) {
    if (!this.world_state.defeated_trainers_ids.includes(trainerId)) {
      this.world_state.defeated_trainers_ids.push(trainerId);
    }
  }

  /**
   * Check if a trainer has been defeated.
   * @param {number|string} trainerId
   * @returns {boolean}
   */
  isTrainerDefeated(trainerId) {
    return this.world_state.defeated_trainers_ids.includes(trainerId);
  }

  /**
   * Record a discovered area.
   * @param {string} areaId
   */
  discoverArea(areaId) {
    if (!this.world_state.discovered_areas.includes(areaId)) {
      this.world_state.discovered_areas.push(areaId);
    }
  }

  // ─── Party Management ──────────────────────────────────────────────────

  /**
   * Check if party has a Pokemon of a given type.
   * @param {string} type
   * @returns {Pokemon|null}
   */
  getPartyMemberByType(type) {
    return this.playerParty.find(p => p.types.includes(type)) || null;
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
   * Add a Pokemon to the party (max 6).
   * @param {Pokemon} pokemon
   * @returns {boolean} True if added, false if party full
   */
  addToParty(pokemon) {
    if (this.playerParty.length >= 6) return false;
    this.playerParty.push(pokemon);
    return true;
  }

  // ─── Serialization ─────────────────────────────────────────────────────

  /**
   * Serializes the entire game state into a plain object.
   * @returns {object}
   */
  serialize() {
    return {
      playerParty: this.playerParty.map(p => p.serialize()),
      inventory: JSON.parse(JSON.stringify(this.inventory)),
      location: { ...this.location },
      story_progression: { ...this.story_progression },
      world_state: {
        ...this.world_state,
        defeated_trainers_ids: [...this.world_state.defeated_trainers_ids],
        opened_chests_ids: [...this.world_state.opened_chests_ids],
        discovered_areas: [...this.world_state.discovered_areas],
      },
    };
  }

  /**
   * Deserializes game state from a plain object.
   * @param {object} data
   */
  deserialize(data) {
    if (!data) return;
    
    this.playerParty = (data.playerParty || []).map(pData => Pokemon.deserialize(pData));
    
    if (data.inventory) {
      this.inventory = JSON.parse(JSON.stringify(data.inventory));
    }
    
    if (data.location) {
      this.location = { ...this.location, ...data.location };
    }
    
    if (data.story_progression) {
      this.story_progression = { ...this.story_progression, ...data.story_progression };
    }
    
    if (data.world_state) {
      this.world_state = {
        ...this.world_state,
        ...data.world_state,
        defeated_trainers_ids: data.world_state.defeated_trainers_ids || [],
        opened_chests_ids: data.world_state.opened_chests_ids || [],
        discovered_areas: data.world_state.discovered_areas || [],
      };
    }
    
    console.log('[GameState] State deserialized.');
  }
}
