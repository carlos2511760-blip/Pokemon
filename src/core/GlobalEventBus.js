/**
 * GlobalEventBus.js
 *
 * Strongly-typed, GC-safe Event Bus for decoupled inter-system communication.
 *
 * Features:
 *  - Typed events via GameEvents constants (no magic strings at call sites)
 *  - WeakRef subscribers to prevent memory leaks when scenes/objects are destroyed
 *  - Execution priority per subscriber (lower number = runs first)
 *  - Automatic cleanup of dead references on every emit
 *  - One-shot subscriptions (subscribe once, auto-unsubscribe)
 *
 * Usage:
 *   import { GlobalEventBus } from './GlobalEventBus.js';
 *   import { GameEvents } from './GameEvents.js';
 *
 *   // Subscribe
 *   const unsub = GlobalEventBus.on(GameEvents.PLAYER_TILE_ENTERED, (payload) => {
 *     console.log('Player stepped on tile', payload.tileX, payload.tileY);
 *   }, { priority: 0 });
 *
 *   // Unsubscribe when done (e.g., in scene shutdown)
 *   unsub();
 *
 *   // Emit from any system
 *   GlobalEventBus.emit(GameEvents.PLAYER_TILE_ENTERED, { tileX: 5, tileY: 9 });
 *
 * @module GlobalEventBus
 */

/**
 * @typedef {Object} SubscriberEntry
 * @property {WeakRef<object>} holderRef - WeakRef to the object holding the callback (for GC safety).
 * @property {Function} callback - The event handler function.
 * @property {number} priority - Lower = runs first.
 * @property {boolean} once - If true, auto-removed after first invocation.
 * @property {symbol} id - Unique identifier for this subscription.
 */

class GlobalEventBusImpl {
  constructor() {
    /** @type {Map<string, SubscriberEntry[]>} */
    this._listeners = new Map();

    /** Tracks total emissions for diagnostics */
    this._emitCount = 0;
  }

  /**
   * Subscribe to an event.
   *
   * @param {string} eventKey - Event key from GameEvents constants.
   * @param {Function} callback - Handler function called with the payload.
   * @param {object} [options]
   * @param {object} [options.holder] - The object that "owns" this subscription.
   *   If provided and the object is GC'd, the subscription is automatically cleaned up.
   *   If omitted, uses a permanent sentinel object (never GC'd).
   * @param {number} [options.priority=50] - Execution priority (0=highest, 100=lowest).
   * @param {boolean} [options.once=false] - If true, unsubscribes after first call.
   * @returns {Function} Unsubscribe function. Call it to manually remove this subscription.
   */
  on(eventKey, callback, options = {}) {
    const { holder = null, priority = 50, once = false } = options;

    if (typeof callback !== 'function') {
      throw new Error(`[GlobalEventBus] on("${eventKey}") requires a function callback.`);
    }

    // If no holder, use a permanent sentinel that never gets GC'd
    const sentinel = holder ?? this._getSentinel();
    const ref = new WeakRef(sentinel);
    const id = Symbol();

    const entry = { holderRef: ref, callback, priority, once, id };

    if (!this._listeners.has(eventKey)) {
      this._listeners.set(eventKey, []);
    }

    const list = this._listeners.get(eventKey);
    list.push(entry);
    // Keep sorted by priority ascending (lower = first)
    list.sort((a, b) => a.priority - b.priority);

    // Return the unsubscribe function
    return () => this._removeById(eventKey, id);
  }

  /**
   * Subscribe to an event, unsubscribing automatically after one invocation.
   * @param {string} eventKey
   * @param {Function} callback
   * @param {object} [options]
   * @returns {Function} Unsubscribe function.
   */
  once(eventKey, callback, options = {}) {
    return this.on(eventKey, callback, { ...options, once: true });
  }

  /**
   * Emit an event, invoking all active subscribers in priority order.
   * Dead WeakRefs are automatically purged during this pass.
   *
   * @param {string} eventKey - Event key from GameEvents constants.
   * @param {any} [payload] - Data to pass to subscribers.
   */
  emit(eventKey, payload) {
    this._emitCount++;
    const list = this._listeners.get(eventKey);
    if (!list || list.length === 0) return;

    const dead = [];
    const expired = [];

    for (const entry of list) {
      const holder = entry.holderRef.deref();
      if (holder === undefined) {
        // Holder was GC'd, mark for removal
        dead.push(entry.id);
        continue;
      }

      try {
        entry.callback(payload);
      } catch (err) {
        console.error(`[GlobalEventBus] Error in subscriber for "${eventKey}":`, err);
      }

      if (entry.once) {
        expired.push(entry.id);
      }
    }

    // Purge dead and once-fired subscriptions
    if (dead.length > 0 || expired.length > 0) {
      const deadSet = new Set([...dead, ...expired]);
      const purged = list.filter(e => !deadSet.has(e.id));
      this._listeners.set(eventKey, purged);
    }
  }

  /**
   * Remove all subscriptions for a specific event key.
   * @param {string} eventKey
   */
  offAll(eventKey) {
    this._listeners.delete(eventKey);
  }

  /**
   * Remove all subscriptions owned by a specific holder object.
   * Call this in scene `shutdown()` or object `destroy()` to clean up.
   * @param {object} holder
   */
  offHolder(holder) {
    for (const [key, list] of this._listeners.entries()) {
      const filtered = list.filter(e => {
        const h = e.holderRef.deref();
        return h !== undefined && h !== holder;
      });
      if (filtered.length !== list.length) {
        this._listeners.set(key, filtered);
      }
    }
  }

  /**
   * Returns diagnostic info about the bus state.
   * @returns {{ totalEvents: number, totalSubscribers: number, emitCount: number }}
   */
  diagnostics() {
    let totalSubscribers = 0;
    for (const list of this._listeners.values()) {
      totalSubscribers += list.length;
    }
    return {
      totalEvents: this._listeners.size,
      totalSubscribers,
      emitCount: this._emitCount,
    };
  }

  /** @private */
  _removeById(eventKey, id) {
    const list = this._listeners.get(eventKey);
    if (!list) return;
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) list.splice(idx, 1);
  }

  /** @private — Sentinel object kept alive indefinitely */
  _getSentinel() {
    if (!this._sentinel) {
      this._sentinel = Object.freeze({ __type: 'GlobalEventBusSentinel' });
    }
    return this._sentinel;
  }
}

// Export a singleton instance
export const GlobalEventBus = new GlobalEventBusImpl();
