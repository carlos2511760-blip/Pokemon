import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Pokemon from '../entities/Pokemon.js';
import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import { ServiceLocator, ServiceKeys } from '../core/ServiceLocator.js';

const TILE_SIZE = 16;

const METAL_FLOOR = 0;
const WALL = 1;
const BROKEN_PIPE = 2;
const GENERATOR = 3;
const CRATE = 4;
const CONSOLE = 5;
const DOORMAT = 6;
const WARNING_STRIPE = 7;
const DEBRIS = 8;
const VENT = 9;

const SOLID_TILES = new Set([WALL, BROKEN_PIPE, GENERATOR, CRATE, CONSOLE, VENT]);

const FACILITY_MAP = {
  width: 20,
  height: 15,
  data: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
    [1,0,0,0,4,0,0,0,0,3,3,0,0,0,0,0,0,0,0,1],
    [1,0,0,4,4,0,0,7,7,7,7,7,7,0,0,2,2,0,0,1],
    [1,0,0,0,0,0,0,7,0,0,0,5,7,0,0,0,2,0,0,1],
    [1,0,8,0,0,0,0,7,0,0,0,0,7,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,7,7,7,7,7,7,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,2,0,0,0,0,0,0,0,0,0,4,4,0,0,0,1],
    [1,0,0,2,2,0,0,0,0,0,0,0,0,0,0,4,0,0,0,1],
    [1,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,9,0,0,0,0,0,0,0,6,6,0,0,0,0,0,0,0,9,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]
};

export default class FacilityScene extends Phaser.Scene {
  constructor() {
    super('FacilityScene');
  }

  preload() {
    this.generateTextures();
  }

  _makeTile(key, drawFn) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }

  generateTextures() {
    this._makeTile('fac_0', (g) => {
      g.fillStyle(0x3A3A3A); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x444444); g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    });
    this._makeTile('fac_1', (g) => {
      g.fillStyle(0x2C3E50); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4A6A8A);
      g.fillRect(4, 4, 2, 2); g.fillRect(10, 4, 2, 2);
      g.fillRect(4, 10, 2, 2); g.fillRect(10, 10, 2, 2);
    });
    this._makeTile('fac_2', (g) => {
      g.fillStyle(0x3A3A3A); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x8B4513); g.fillRect(4, 0, 8, 16);
      g.fillStyle(0x5A2E0C); g.fillRect(2, 4, 12, 3); g.fillRect(2, 10, 12, 3);
    });
    this._makeTile('fac_3', (g) => {
      g.fillStyle(0x1A1A2E); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x333333); g.fillRect(2, 2, 12, 12);
      g.fillStyle(0xAA0000); g.fillRect(6, 6, 4, 4);
    });
    this._makeTile('fac_3_active', (g) => {
      g.fillStyle(0x1A1A2E); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x333333); g.fillRect(2, 2, 12, 12);
      g.fillStyle(0x00AA00); g.fillRect(6, 6, 4, 4);
    });
    this._makeTile('fac_4', (g) => {
      g.fillStyle(0x6B4226); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x888888);
      g.fillRect(0, 0, 16, 2); g.fillRect(0, 14, 16, 2);
      g.fillRect(0, 0, 2, 16); g.fillRect(14, 0, 2, 16);
    });
    this._makeTile('fac_5', (g) => {
      g.fillStyle(0x333333); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x0066FF); g.fillRect(2, 2, 12, 8);
    });
    this._makeTile('fac_6', (g) => {
      g.fillStyle(0x3A3A3A); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x00FF00);
      g.fillRect(6, 10, 4, 4); g.fillRect(7, 6, 2, 4);
    });
    this._makeTile('fac_7', (g) => {
      g.fillStyle(0xFFCC00); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x000000); g.fillRect(0, 0, 4, 16); g.fillRect(8, 0, 4, 16);
    });
    this._makeTile('fac_8', (g) => {
      g.fillStyle(0x3A3A3A); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x888888); g.fillRect(4, 4, 3, 2);
      g.fillStyle(0x8B4513); g.fillRect(10, 8, 2, 3);
    });
    this._makeTile('fac_9', (g) => {
      g.fillStyle(0x222222); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x555555);
      g.fillRect(2, 2, 12, 1); g.fillRect(2, 6, 12, 1);
      g.fillRect(2, 10, 12, 1); g.fillRect(2, 14, 12, 1);
    });
  }

  create() {
    this.gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
    this.prologuePhase = 'explore'; // Start directly in explore mode (no intro dialogue)

    // Render map
    this.tileSprites = [];
    for (let y = 0; y < FACILITY_MAP.height; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < FACILITY_MAP.width; x++) {
        const tileId = FACILITY_MAP.data[y][x];
        const key = 'fac_' + tileId;
        const img = this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key);
        img.setDepth(0);
        this.tileSprites[y][x] = img;
      }
    }

    const isSolid = (tileX, tileY) => {
      if (tileX < 0 || tileY < 0 || tileX >= FACILITY_MAP.width || tileY >= FACILITY_MAP.height) return true;
      return SOLID_TILES.has(FACILITY_MAP.data[tileY][tileX]);
    };

    // Spawn Player — ready to move immediately
    this.player = new Player(this, 10, 12, isSolid);
    this.player.facing = 'up';
    this.player.setTexture('player_up');

    // Camera
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, FACILITY_MAP.width * TILE_SIZE, FACILITY_MAP.height * TILE_SIZE);

    // --- Doormat handler (no dialogue) ---
    GlobalEventBus.on(GameEvents.PLAYER_TILE_ENTERED, (payload) => {
      if (FACILITY_MAP.data[payload.tileY][payload.tileX] === DOORMAT) {
        if (this.gameState.getFlag('prologue_complete')) {
          this.exitToWorld();
        } else {
          // Bounce back silently
          this.player.setGridPosition(this.player.tileX, this.player.tileY - 1);
        }
      }
    }, { holder: this });

    this.events.on('shutdown', () => {
      GlobalEventBus.offHolder(this);
    });

    // --- Resume from battle (no dialogue) ---
    this.events.on('resume', () => {
      if (this.prologuePhase === 'battle') {
        this.prologuePhase = 'outro';
        this.time.delayedCall(500, () => {
          // Set completion flags immediately
          this.gameState.setFlag('prologue_complete', true);
          this.gameState.setFlag('received_starter_trio', true);
          
          const saveService = ServiceLocator.resolve(ServiceKeys.SAVE);
          saveService.saveGame().then(() => {
            this.exitToWorld();
          });
        });
      }
    });

    // --- Visual setup based on prologue state ---
    if (this.gameState.getFlag('prologue_complete')) {
      this.cameras.main.setAlpha(1.0);
      this.tileSprites[2][9].setTexture('fac_3_active');
      this.tileSprites[2][10].setTexture('fac_3_active');
    } else {
      // Dim scene (power outage), fade in
      this.cameras.main.setAlpha(0.6);
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // Interaction key (keyboard)
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  exitToWorld() {
    this.gameState.location.scene = 'WorldScene';
    this.gameState.location.x = 5;
    this.gameState.location.y = 9;
    this.gameState.location.facing = 'down';

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene');
    });
  }

  update(time, delta) {
    // Player movement (always active — no textbox blocking)
    this.player.update(time, delta);

    // Interaction: keyboard OR touch A button
    const touch = (typeof window !== 'undefined' && window.__TOUCH_INPUT__) || {};
    const interactDown = (this.interactKey && this.interactKey.isDown) ||
                         (this.spaceKey && this.spaceKey.isDown) ||
                         touch.action;

    if (interactDown && !this.lastActionDown) {
      this.handleInteraction();
    }
    this.lastActionDown = interactDown;
  }

  handleInteraction() {
    const front = this.player.getTileInFront();
    if (front.x < 0 || front.y < 0 || front.x >= FACILITY_MAP.width || front.y >= FACILITY_MAP.height) return;
    
    const tileId = FACILITY_MAP.data[front.y][front.x];

    if (tileId === GENERATOR && this.prologuePhase === 'explore') {
      const hasElectric = this.gameState.getPartyMemberByType('electric');
      
      if (hasElectric) {
        // Activate generator (no dialogue)
        this.tileSprites[2][9].setTexture('fac_3_active');
        this.tileSprites[2][10].setTexture('fac_3_active');
        this.cameras.main.setAlpha(1.0);
        this.prologuePhase = 'generator_active';

        // Trigger forced encounter after a brief pause
        this.time.delayedCall(800, () => {
          this.prologuePhase = 'battle';
          this.cameras.main.flash(500, 255, 255, 255);
          this.time.delayedCall(500, () => {
            const zubat = new Pokemon(41, 3);
            this.scene.launch('BattleScene', {
              wildPokemon: zubat,
              playerPokemon: this.gameState.playerParty[0],
              parentScene: 'FacilityScene'
            });
            this.scene.pause();
          });
        });
      }
    }
  }
}
