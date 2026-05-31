/**
 * Pokemon.js — Refactored with Production Architecture
 *
 * Architecture principles applied:
 *  1. STATIC DATA (SpeciesData): Immutable, loaded from POKEDEX by ID reference.
 *     Never duplicated into the instance — only the speciesId is stored.
 *  2. DYNAMIC STATE (RuntimeState): Only mutable runtime values are stored:
 *     currentHp, statusId, xp, battle modifiers, current moves PP.
 *  3. MODIFIER STACK: All combat stats (attack, defense, speed) are resolved
 *     dynamically via ModifierStack. Base stats are NEVER permanently mutated.
 *
 * This design means:
 *  - Level-up recalculation is safe (no stale base stat)
 *  - Burn/paralysis/items modify stats without data corruption
 *  - Saving only requires serializing the RuntimeState, not recomputing everything
 */

import { POKEDEX } from '../data/pokedex.js';
import { MOVES } from '../data/moves.js';
import { ModifierStack } from '../core/ModifierStack.js';

// ─── Status Effect IDs ───────────────────────────────────────────────────────
export const StatusEffect = Object.freeze({
  NONE:     null,
  BURN:     'burn',
  POISON:   'poison',
  PARALYSIS: 'paralysis',
  SLEEP:    'sleep',
  FREEZE:   'freeze',
});

export default class Pokemon {
  /**
   * @param {number} speciesId - National Pokedex number.
   * @param {number} level - Starting level (1–100).
   */
  constructor(speciesId, level) {
    const species = POKEDEX[speciesId];
    if (!species) {
      throw new Error(`[Pokemon] Unknown species ID: ${speciesId}`);
    }

    // ── STATIC DATA (references only) ──────────────────────────────
    /** @type {number} The species ID — pointer into POKEDEX static data. */
    this.speciesId = speciesId;

    // ── DYNAMIC STATE (mutable runtime values) ─────────────────────
    this.level = level;
    this.xp = 0;
    this.xpToNext = this._xpForLevel(level);

    /** @type {string|null} Current status effect ID */
    this.statusId = StatusEffect.NONE;

    /** @type {number} Sleep turns remaining (when status = SLEEP) */
    this.sleepTurns = 0;

    // ── MODIFIER STACK (dynamic stat modifications) ────────────────
    /**
     * Modifier stack for runtime combat modifiers.
     * Battle stage changes, status effects, held items all go here.
     * @type {ModifierStack}
     */
    this.modifiers = new ModifierStack();

    // ── DERIVED STATE (calculated from static + dynamic) ───────────
    const baseHp = this._computeHp();
    /** @type {number} Maximum HP (recalculated on level-up). */
    this.maxHp = baseHp;
    /** @type {number} Current HP — the only mutable HP value. */
    this.currentHp = baseHp;

    // ── MOVESET ────────────────────────────────────────────────────
    /**
     * Array of active moves with current PP.
     * Each entry: { id, name, type, category, power, accuracy, pp, currentPp }
     */
    this.moves = this._buildMoveset();
  }

  // ─── Static Data Accessors ──────────────────────────────────────────────

  /** @returns {object} The immutable species definition from POKEDEX. */
  get species() {
    return POKEDEX[this.speciesId];
  }

  /** @returns {string} Pokemon name. */
  get name() { return this.species.name; }

  /** @returns {string[]} Type array (e.g. ['fire'] or ['water', 'flying']). */
  get types() { return this.species.types; }

  /** @returns {number} PokeAPI sprite ID for rendering. */
  get spriteId() { return this.species.spriteId; }

  // ─── Stat Resolution (Modifier Stack Pattern) ───────────────────────────

  /**
   * Compute the raw base stat value for a stat key.
   * Formula: floor((baseStat * 2) * level / 100) + level + 10
   * @param {string} statKey - 'attack'|'defense'|'speed'
   * @returns {number}
   */
  _computeBaseStat(statKey) {
    const base = this.species.baseStats[statKey];
    return Math.floor(((base * 2) * this.level) / 100) + this.level + 10;
  }

  /**
   * Compute raw HP (separate formula includes extra +level+10).
   * @returns {number}
   */
  _computeHp() {
    const base = this.species.baseStats.hp;
    return Math.floor(((base * 2) * this.level) / 100) + this.level + 10;
  }

  /**
   * Resolve the FINAL attack value, applying all active modifiers.
   * This is what gets used in damage calculations.
   * @returns {number}
   */
  get attack() {
    return this.modifiers.resolve('attack', this._computeBaseStat('attack'));
  }

  /**
   * Resolve the FINAL defense value, applying all active modifiers.
   * @returns {number}
   */
  get defense() {
    return this.modifiers.resolve('defense', this._computeBaseStat('defense'));
  }

  /**
   * Resolve the FINAL speed value, applying all active modifiers.
   * @returns {number}
   */
  get speed() {
    return this.modifiers.resolve('speed', this._computeBaseStat('speed'));
  }

  // ─── Combat ─────────────────────────────────────────────────────────────

  /**
   * Apply damage to this Pokemon.
   * @param {number} amount - Damage dealt (clamped to 0).
   * @returns {boolean} True if the Pokemon fainted (currentHp === 0).
   */
  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - Math.floor(amount));
    return this.currentHp === 0;
  }

  /**
   * Restore HP by an amount (clamped to maxHp).
   * @param {number} amount
   */
  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + Math.floor(amount));
  }

  /** @returns {boolean} */
  isAlive() {
    return this.currentHp > 0;
  }

  /**
   * Apply a status effect.
   * @param {string} statusId - From StatusEffect enum.
   * @param {number} [sleepTurns=3] - Relevant only for SLEEP.
   * @returns {boolean} True if status was successfully applied (false if already statused).
   */
  applyStatus(statusId, sleepTurns = 3) {
    if (this.statusId !== StatusEffect.NONE) return false;
    this.statusId = statusId;
    if (statusId === StatusEffect.SLEEP) {
      this.sleepTurns = sleepTurns;
    }
    if (statusId === StatusEffect.BURN) {
      this.modifiers.add('status:burn', 'attack', 'percent', 0.5);
    }
    if (statusId === StatusEffect.PARALYSIS) {
      this.modifiers.add('status:paralysis', 'speed', 'percent', 0.5);
    }
    return true;
  }

  /**
   * Remove the current status effect and its associated modifiers.
   */
  clearStatus() {
    if (this.statusId === StatusEffect.BURN) {
      this.modifiers.remove('status:burn');
    }
    if (this.statusId === StatusEffect.PARALYSIS) {
      this.modifiers.remove('status:paralysis');
    }
    this.statusId = StatusEffect.NONE;
    this.sleepTurns = 0;
  }

  /**
   * Process end-of-turn status effects. Returns a description of what happened.
   * @returns {{ event: string|null, damage: number }}
   */
  processEndOfTurn() {
    if (this.statusId === StatusEffect.BURN) {
      const dmg = Math.max(1, Math.floor(this.maxHp / 16));
      this.takeDamage(dmg);
      return { event: 'burn_damage', damage: dmg };
    }
    if (this.statusId === StatusEffect.POISON) {
      const dmg = Math.max(1, Math.floor(this.maxHp / 8));
      this.takeDamage(dmg);
      return { event: 'poison_damage', damage: dmg };
    }
    return { event: null, damage: 0 };
  }

  /**
   * Clear all battle-state modifiers (stages, temporary buffs).
   * Call this when a Pokemon is withdrawn or the battle ends.
   * Does NOT clear status effects (those persist outside battle).
   */
  clearBattleModifiers() {
    // Remove stage modifiers but keep status modifiers
    const stageKeys = this.modifiers.getAll()
      .filter(m => m.source.startsWith('stage:'))
      .map(m => m.source);
    for (const key of stageKeys) {
      this.modifiers.remove(key);
    }
  }

  // ─── XP & Leveling ──────────────────────────────────────────────────────

  /**
   * XP required to reach the next level (Medium Fast formula).
   * @param {number} level
   * @returns {number}
   */
  _xpForLevel(level) {
    return level * 25;
  }

  /**
   * Award XP.
   * @param {number} amount
   * @returns {boolean} True if the Pokemon leveled up.
   */
  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this._levelUp();
      return true;
    }
    return false;
  }

  /** @private */
  _levelUp() {
    this.level += 1;

    // Recalculate max HP with new level — restore the HP delta gained
    const oldMax = this.maxHp;
    const newMax = this._computeHp();
    const hpDelta = newMax - oldMax;
    this.maxHp = newMax;
    this.currentHp = Math.min(this.maxHp, this.currentHp + hpDelta);

    // Rebuild moveset to include newly learned moves
    this.moves = this._buildMoveset();

    // Update XP threshold
    this.xpToNext = this._xpForLevel(this.level);
  }

  // ─── Moveset ────────────────────────────────────────────────────────────

  /** @private */
  _buildMoveset() {
    const learnset = this.species.learnset;
    const available = learnset.filter(entry => entry.level <= this.level);
    const selected = available.slice(-4); // Last 4 = most recently learned

    return selected.map(entry => {
      const moveData = MOVES[entry.moveId];
      if (!moveData) {
        throw new Error(`[Pokemon] Unknown move ID: "${entry.moveId}" for species ${this.speciesId}`);
      }
      return { id: entry.moveId, ...moveData, currentPp: moveData.pp };
    });
  }

  /**
   * Deduct PP from a move.
   * @param {number} moveIndex - Index in this.moves.
   * @returns {boolean} True if the move has PP remaining.
   */
  useMoveAt(moveIndex) {
    const move = this.moves[moveIndex];
    if (!move || move.currentPp <= 0) return false;
    move.currentPp -= 1;
    return true;
  }

  // ─── Serialization (Save System) ────────────────────────────────────────

  /**
   * Serialize only the dynamic runtime state.
   * Static species data is reconstructed from the ID on load.
   * @returns {object}
   */
  serialize() {
    return {
      speciesId:  this.speciesId,
      level:      this.level,
      currentHp:  this.currentHp,
      xp:         this.xp,
      statusId:   this.statusId,
      sleepTurns: this.sleepTurns,
      // Only save current PP per move slot (moves are rebuilt from learnset)
      movesPp:    this.moves.map(m => m.currentPp),
      modifiers:  this.modifiers.serialize(),
    };
  }

  /**
   * Restore a Pokemon instance from serialized save data.
   * @param {object} data - From serialize().
   * @returns {Pokemon}
   */
  static deserialize(data) {
    const pokemon = new Pokemon(data.speciesId, data.level);
    pokemon.currentHp  = data.currentHp;
    pokemon.xp         = data.xp;
    pokemon.statusId   = data.statusId ?? StatusEffect.NONE;
    pokemon.sleepTurns = data.sleepTurns ?? 0;
    // Restore move PP
    if (data.movesPp) {
      data.movesPp.forEach((pp, i) => {
        if (pokemon.moves[i]) pokemon.moves[i].currentPp = pp;
      });
    }
    pokemon.modifiers.deserialize(data.modifiers ?? {});
    return pokemon;
  }
}
