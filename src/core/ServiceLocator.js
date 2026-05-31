/**
 * ServiceLocator.js
 *
 * Lightweight Service Locator pattern for global subsystem management.
 *
 * Principles:
 *  - No singleton classes with heavy business logic.
 *  - All systems communicate through registered interfaces (contracts).
 *  - Services can be swapped for mocks during unit testing.
 *
 * Usage:
 *   // Registering a service
 *   ServiceLocator.register('audio', new AudioService());
 *
 *   // Resolving a service from anywhere
 *   const audio = ServiceLocator.resolve('audio');
 *   audio.play('bgm_pallet');
 *
 *   // Providing a mock in tests
 *   ServiceLocator.register('audio', new MockAudioService());
 *
 * @module ServiceLocator
 */

class ServiceLocatorImpl {
  constructor() {
    /** @type {Map<string, any>} */
    this._registry = new Map();

    /** @type {Map<string, Set<Function>>} */
    this._readyCallbacks = new Map();
  }

  /**
   * Register a service instance under a key.
   * Overwrites any previously registered service with the same key.
   * @param {string} key - Unique service identifier (e.g. 'audio', 'save', 'input').
   * @param {object} instance - The service implementation.
   * @throws {Error} if key or instance is invalid.
   */
  register(key, instance) {
    if (!key || typeof key !== 'string') {
      throw new Error('[ServiceLocator] register() requires a non-empty string key.');
    }
    if (instance == null) {
      throw new Error(`[ServiceLocator] Cannot register null/undefined for key "${key}".`);
    }

    this._registry.set(key, instance);

    // Notify any deferred resolution callbacks
    if (this._readyCallbacks.has(key)) {
      for (const cb of this._readyCallbacks.get(key)) {
        try { cb(instance); } catch (e) { console.error('[ServiceLocator] Error in ready callback:', e); }
      }
      this._readyCallbacks.delete(key);
    }

    if (import.meta.env?.DEV) {
      console.debug(`[ServiceLocator] Registered service: "${key}"`, instance.constructor?.name ?? typeof instance);
    }
  }

  /**
   * Resolve a service by key.
   * @param {string} key - The service key.
   * @returns {any} The registered service instance.
   * @throws {Error} if no service is registered for the key.
   */
  resolve(key) {
    const service = this._registry.get(key);
    if (service === undefined) {
      throw new Error(
        `[ServiceLocator] No service registered for key "${key}". ` +
        `Did you forget to call ServiceLocator.register("${key}", ...)?`
      );
    }
    return service;
  }

  /**
   * Resolve a service, or null if not registered (non-throwing version).
   * @param {string} key
   * @returns {any|null}
   */
  tryResolve(key) {
    return this._registry.get(key) ?? null;
  }

  /**
   * Check whether a service is currently registered.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this._registry.has(key);
  }

  /**
   * Execute a callback as soon as the service is available.
   * If it's already registered, fires immediately.
   * Useful for systems that initialize in parallel.
   * @param {string} key
   * @param {Function} callback - Called with the service instance.
   */
  onReady(key, callback) {
    if (this._registry.has(key)) {
      callback(this._registry.get(key));
      return;
    }
    if (!this._readyCallbacks.has(key)) {
      this._readyCallbacks.set(key, new Set());
    }
    this._readyCallbacks.get(key).add(callback);
  }

  /**
   * Unregister a service. Used for cleanup or test teardown.
   * @param {string} key
   */
  unregister(key) {
    this._registry.delete(key);
  }

  /**
   * Clear all registered services.
   * Used for full reset between tests.
   */
  clear() {
    this._registry.clear();
    this._readyCallbacks.clear();
  }

  /**
   * Returns a list of all currently registered service keys.
   * @returns {string[]}
   */
  listKeys() {
    return [...this._registry.keys()];
  }
}

// Export a singleton instance of the locator
export const ServiceLocator = new ServiceLocatorImpl();

// ─── Service Key Constants ──────────────────────────────────────────────────
// Use these constants instead of raw strings to avoid typos.
export const ServiceKeys = Object.freeze({
  AUDIO:        'audio',
  SAVE:         'save',
  INPUT:        'input',
  LOCALIZATION: 'localization',
  EVENT_BUS:    'eventBus',
  GAME_STATE:   'gameState',
});
