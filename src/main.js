import Phaser from 'phaser';
import WorldScene from './scene/WorldScene.js';
import IndoorScene from './scene/IndoorScene.js';
import BattleScene from './scene/BattleScene.js';
import FacilityScene from './scene/FacilityScene.js';
import { ServiceLocator, ServiceKeys } from './core/ServiceLocator.js';
import { GlobalEventBus } from './core/GlobalEventBus.js';
import GameState from './core/GameState.js';
import SaveService from './core/SaveService.js';

// --- Initialize Global Services ---
const gameState = new GameState();
const saveService = new SaveService();

ServiceLocator.register(ServiceKeys.GAME_STATE, gameState);
ServiceLocator.register(ServiceKeys.SAVE, saveService);
ServiceLocator.register(ServiceKeys.EVENT_BUS, GlobalEventBus);

// Attempt to load game, otherwise start new game
saveService.loadGame().then((loaded) => {
  if (!loaded) {
    gameState.newGame();
  }

  // --- Boot Phaser Game ---
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [FacilityScene, WorldScene, IndoorScene, BattleScene]
  };

  const game = new Phaser.Game(config);
  window.game = game;
});
