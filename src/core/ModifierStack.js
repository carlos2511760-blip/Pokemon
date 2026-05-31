/**
 * ModifierStack.js
 *
 * Implements the Modifier Stack Pattern for dynamic Pokemon stat calculation.
 *
 * Why this exists:
 *   Instead of permanently modifying base stats (which causes hard-to-track bugs),
 *   all runtime modifications are stored as a layered stack of modifiers.
 *   The final stat value is calculated on-demand from: BaseValue → Flat Modifiers → Percent Modifiers.
 *
 * Application order:
 *   1. Start with the base value (from species data + IV/EV formula)
 *   2. Apply all FLAT modifiers (addition/subtraction)
 *   3. Apply all PERCENT modifiers (multiplication)
 *
 * Example:
 *   base Attack = 50
 *   + Swords Dance (flat +0, percent +100%) → 100
 *   + Burn (flat 0, percent -50%)           → 50
 *   Final Attack = 50
 *
 * @module ModifierStack
 */

/**
 * @typedef {'flat'|'percent'} ModifierType
 *   - 'flat':    value is added/subtracted directly  (e.g. +10 attack)
 *   - 'percent': value is a multiplier applied last  (e.g. 0.5 = -50%, 2.0 = +100%)
 */

/**
 * @typedef {Object} Modifier
 * @property {string} source - Unique identifier for the modifier source (e.g. 'burn', 'swordsdance', 'item:choiceband').
 * @property {string} stat - Which stat this affects (e.g. 'attack', 'defense', 'speed', 'hp').
 * @property {ModifierType} type - Application type.
 * @property {number} value - The modifier value.
 * @property {number|null} duration - Remaining turns before expiry. null = permanent.
 * @property {number} priority - Lower = applied first within same type (default 50).
 */

export class ModifierStack {
  constructor() {
    /** @type {Modifier[]} */
    this._modifiers = [];
  }

  /**
   * Add a modifier to the stack.
   * If a modifier with the same source+stat combination already exists, it is replaced.
   *
   * @param {string} source - Unique identifier for this modifier's source.
   * @param {string} stat - The stat affected.
   * @param {ModifierType} type - 'flat' or 'percent'.
   * @param {number} value - The modifier value.
   * @param {number|null} [duration=null] - Turns until expiry. null = permanent.
   * @param {number} [priority=50] - Application priority within same type.
   */
  add(source, stat, type, value, duration = null, priority = 50) {
    // Remove existing modifier with same source+stat to prevent stacking
    this.remove(source, stat);

    this._modifiers.push({ source, stat, type, value, duration, priority });
  }

  /**
   * Remove all modifiers from a specific source (and optionally a specific stat).
   * @param {string} source
   * @param {string|null} [stat=null] - If provided, only removes modifiers for that stat.
   */
  remove(source, stat = null) {
    this._modifiers = this._modifiers.filter(m => {
      if (m.source !== source) return true;
      if (stat !== null && m.stat !== stat) return true;
      return false;
    });
  }

  /**
   * Remove all modifiers from all sources.
   * Used when leaving battle or resetting state.
   */
  clear() {
    this._modifiers = [];
  }

  /**
   * Advance one turn. Decrements duration on all timed modifiers and removes expired ones.
   * Call this at the end of each battle turn.
   * @returns {string[]} Array of source names for expired modifiers (for event reporting).
   */
  tick() {
    const expired = [];
    this._modifiers = this._modifiers.filter(m => {
      if (m.duration === null) return true; // permanent
      m.duration -= 1;
      if (m.duration <= 0) {
        expired.push(m.source);
        return false;
      }
      return true;
    });
    return expired;
  }

  /**
   * Calculate the final value for a given stat by applying all active modifiers.
   *
   * @param {string} stat - The stat key to resolve (e.g. 'attack').
   * @param {number} baseValue - The unmodified base value for this stat.
   * @returns {number} The resolved final value, floored to an integer, minimum 1.
   */
  resolve(stat, baseValue) {
    const relevant = this._modifiers.filter(m => m.stat === stat);

    if (relevant.length === 0) return baseValue;

    // Step 1: Apply flat modifiers (sorted by priority)
    const flatMods = relevant
      .filter(m => m.type === 'flat')
      .sort((a, b) => a.priority - b.priority);

    let value = baseValue;
    for (const m of flatMods) {
      value += m.value;
    }

    // Step 2: Apply percent modifiers (sorted by priority)
    const percentMods = relevant
      .filter(m => m.type === 'percent')
      .sort((a, b) => a.priority - b.priority);

    for (const m of percentMods) {
      value *= m.value;
    }

    // Floor to integer and clamp to minimum 1
    return Math.max(1, Math.floor(value));
  }

  /**
   * Check if a modifier from a specific source is currently active.
   * @param {string} source
   * @param {string|null} [stat=null]
   * @returns {boolean}
   */
  has(source, stat = null) {
    return this._modifiers.some(m => {
      if (m.source !== source) return false;
      if (stat !== null && m.stat !== stat) return false;
      return true;
    });
  }

  /**
   * Get all currently active modifiers affecting a specific stat.
   * @param {string} stat
   * @returns {Modifier[]}
   */
  getForStat(stat) {
    return this._modifiers.filter(m => m.stat === stat);
  }

  /**
   * Get all active modifiers (read-only snapshot).
   * @returns {Modifier[]}
   */
  getAll() {
    return [...this._modifiers];
  }

  /**
   * Serialize the modifier stack to a plain object for save data.
   * @returns {object}
   */
  serialize() {
    return { modifiers: this._modifiers.map(m => ({ ...m })) };
  }

  /**
   * Restore the modifier stack from serialized save data.
   * @param {object} data
   */
  deserialize(data) {
    this._modifiers = (data?.modifiers ?? []).map(m => ({ ...m }));
  }
}

// ─── Convenience Modifier Factories ────────────────────────────────────────
// Pre-built modifier descriptors for common battle effects.

/** @returns {Modifier} Burn — halves physical Attack */
export const BurnModifier = () => ({
  source: 'status:burn',
  stat: 'attack',
  type: 'percent',
  value: 0.5,
  duration: null,
  priority: 10,
});

/** @param {number} stages — +1 to +6, each stage = *1.5 */
export const AttackStageModifier = (stages) => ({
  source: 'stage:attack',
  stat: 'attack',
  type: 'percent',
  value: stages > 0
    ? 1 + (stages * 0.5)
    : 1 / (1 + (Math.abs(stages) * 0.5)),
  duration: null,
  priority: 20,
});

/** @param {number} stages */
export const DefenseStageModifier = (stages) => ({
  source: 'stage:defense',
  stat: 'defense',
  type: 'percent',
  value: stages > 0
    ? 1 + (stages * 0.5)
    : 1 / (1 + (Math.abs(stages) * 0.5)),
  duration: null,
  priority: 20,
});

/** @param {number} stages */
export const SpeedStageModifier = (stages) => ({
  source: 'stage:speed',
  stat: 'speed',
  type: 'percent',
  value: stages > 0
    ? 1 + (stages * 0.5)
    : 1 / (1 + (Math.abs(stages) * 0.5)),
  duration: null,
  priority: 20,
});
