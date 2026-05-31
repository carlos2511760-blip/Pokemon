import { GlobalEventBus } from './GlobalEventBus.js';
import { GameEvents } from './GameEvents.js';
import { ServiceLocator, ServiceKeys } from './ServiceLocator.js';

/**
 * SaveService.js
 * 
 * Manages persisting and loading the game state securely.
 * Implements asynchronous saving to prevent UI freezes.
 * Uses Base64 encoding + pseudo-compression for local storage.
 * 
 * In a real production environment (native wrapper), this would use
 * Node.js Streams and AES-256 encryption. For browser context, we simulate
 * it using Web Storage API and obfuscation.
 */
export default class SaveService {
  constructor() {
    this.saveKey = 'pokemon_rpg_save_slot_1';
    this.isSaving = false;
  }

  /**
   * Asynchronously saves the current game state to local storage.
   * Emits events to the GlobalEventBus for UI binding.
   * @returns {Promise<boolean>}
   */
  async saveGame() {
    if (this.isSaving) return false;
    this.isSaving = true;

    GlobalEventBus.emit(GameEvents.SAVE_STARTED);

    try {
      // 1. Resolve GameState from ServiceLocator
      const gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
      
      // 2. Serialize State
      const rawData = gameState.serialize();
      const jsonString = JSON.stringify(rawData);
      
      // 3. Obfuscate/Compress (Simulated async work for UI responsiveness)
      const encodedData = await this._obfuscateAsync(jsonString);

      // 4. Write to disk (localStorage)
      localStorage.setItem(this.saveKey, encodedData);

      GlobalEventBus.emit(GameEvents.SAVE_COMPLETED, { slot: 1 });
      console.log('[SaveService] Game saved successfully.');
      return true;

    } catch (err) {
      console.error('[SaveService] Failed to save game:', err);
      GlobalEventBus.emit(GameEvents.SAVE_FAILED, { error: err });
      return false;

    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Asynchronously loads the game state.
   * @returns {Promise<boolean>} True if load was successful, False if no save exists.
   */
  async loadGame() {
    try {
      const encodedData = localStorage.getItem(this.saveKey);
      if (!encodedData) return false;

      // 1. Decode/Deobfuscate
      const jsonString = await this._deobfuscateAsync(encodedData);
      
      // 2. Parse
      const rawData = JSON.parse(jsonString);

      // 3. Inject into GameState
      const gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
      gameState.deserialize(rawData);

      GlobalEventBus.emit(GameEvents.SAVE_LOADED, { state: gameState });
      console.log('[SaveService] Game loaded successfully.');
      return true;
      
    } catch (err) {
      console.error('[SaveService] Failed to load game. Save file might be corrupted.', err);
      return false;
    }
  }

  /**
   * Simulate async encryption/compression (AES-256 simulation for web)
   * @private
   */
  _obfuscateAsync(str) {
    return new Promise((resolve) => {
      // Small timeout to prevent blocking main thread
      setTimeout(() => {
        // Simple base64 encoding as placeholder for true AES
        // btoa requires ascii, so encodeURI first to support unicode
        resolve(btoa(encodeURIComponent(str)));
      }, 50); 
    });
  }

  /**
   * @private
   */
  _deobfuscateAsync(encoded) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(decodeURIComponent(atob(encoded)));
      }, 50);
    });
  }
}
