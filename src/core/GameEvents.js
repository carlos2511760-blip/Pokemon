/**
 * GameEvents.js
 * Strongly-typed event catalog for the GlobalEventBus.
 * All inter-system communication MUST use these constants.
 * Never use raw string literals for events.
 *
 * @module GameEvents
 */

export const GameEvents = Object.freeze({

  // ─── Player ────────────────────────────────────────────────────────
  /** @type {string} Emitted when the player finishes moving to a new tile.
   *  Payload: { tileX: number, tileY: number }
   */
  PLAYER_TILE_ENTERED: 'player:tileEntered',

  /** @type {string} Emitted when the player presses interact (Enter/Space).
   *  Payload: { facingTile: { x: number, y: number } }
   */
  PLAYER_INTERACTED: 'player:interacted',

  /** @type {string} Emitted when a directional input is buffered by the Player.
   *  Payload: { direction: 'up'|'down'|'left'|'right' }
   */
  PLAYER_INPUT_BUFFERED: 'player:inputBuffered',

  // ─── World ─────────────────────────────────────────────────────────
  /** @type {string} Emitted when a wild encounter is triggered in tall grass.
   *  Payload: { wildPokemon: Pokemon }
   */
  ENCOUNTER_TRIGGERED: 'world:encounterTriggered',

  /** @type {string} Emitted when the player steps onto a door tile.
   *  Payload: { target: string, data: object }
   */
  DOOR_TRIGGERED: 'world:doorTriggered',

  // ─── Battle ────────────────────────────────────────────────────────
  /** @type {string} Emitted when a battle starts.
   *  Payload: { playerPokemon: Pokemon, wildPokemon: Pokemon }
   */
  BATTLE_STARTED: 'battle:started',

  /** @type {string} Emitted immediately when the BattleEngine resolves a turn.
   *  Payload: BattleResolutionReport
   */
  BATTLE_TURN_RESOLVED: 'battle:turnResolved',

  /** @type {string} Emitted after the BattlePresenter finishes all animations.
   *  Payload: { winner: 'player'|'enemy'|null }
   */
  BATTLE_ANIMATIONS_DONE: 'battle:animationsDone',

  /** @type {string} Emitted when the battle is completely over.
   *  Payload: { result: 'win'|'lose'|'run' }
   */
  BATTLE_ENDED: 'battle:ended',

  // ─── Pokemon ───────────────────────────────────────────────────────
  /** @type {string} Emitted when a Pokemon levels up.
   *  Payload: { pokemon: Pokemon, newLevel: number }
   */
  POKEMON_LEVEL_UP: 'pokemon:levelUp',

  /** @type {string} Emitted when a Pokemon faints.
   *  Payload: { pokemon: Pokemon }
   */
  POKEMON_FAINTED: 'pokemon:fainted',

  /** @type {string} Emitted when a modifier is applied to a Pokemon.
   *  Payload: { pokemon: Pokemon, modifier: ModifierDescriptor }
   */
  POKEMON_MODIFIER_ADDED: 'pokemon:modifierAdded',

  /** @type {string} Emitted when a modifier expires or is removed.
   *  Payload: { pokemon: Pokemon, source: string }
   */
  POKEMON_MODIFIER_REMOVED: 'pokemon:modifierRemoved',

  // ─── Save ──────────────────────────────────────────────────────────
  /** @type {string} Emitted before a save operation begins. */
  SAVE_STARTED: 'save:started',

  /** @type {string} Emitted when a save completes successfully.
   *  Payload: { slot: number }
   */
  SAVE_COMPLETED: 'save:completed',

  /** @type {string} Emitted when a save fails.
   *  Payload: { error: Error }
   */
  SAVE_FAILED: 'save:failed',

  /** @type {string} Emitted when a game state is loaded.
   *  Payload: { state: GameStateSnapshot }
   */
  SAVE_LOADED: 'save:loaded',

  // ─── Scene ─────────────────────────────────────────────────────────
  /** @type {string} Emitted when any scene transition starts.
   *  Payload: { from: string, to: string }
   */
  SCENE_TRANSITION: 'scene:transition',
});
