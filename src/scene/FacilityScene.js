import Phaser from 'phaser';
import Player from '../entities/Player.js';
import TextBox from '../ui/TextBox.js';
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
      g.fillStyle(0x3A3A3A);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x444444);
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 0, 1, 16);
    });
    this._makeTile('fac_1', (g) => {
      g.fillStyle(0x2C3E50);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4A6A8A);
      g.fillRect(4, 4, 2, 2);
      g.fillRect(10, 4, 2, 2);
      g.fillRect(4, 10, 2, 2);
      g.fillRect(10, 10, 2, 2);
    });
    this._makeTile('fac_2', (g) => {
      g.fillStyle(0x3A3A3A);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x8B4513);
      g.fillRect(4, 0, 8, 16);
      g.fillStyle(0x5A2E0C);
      g.fillRect(2, 4, 12, 3);
      g.fillRect(2, 10, 12, 3);
    });
    this._makeTile('fac_3', (g) => {
      g.fillStyle(0x1A1A2E);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x333333);
      g.fillRect(2, 2, 12, 12);
      g.fillStyle(0xAA0000); // Default to red light
      g.fillRect(6, 6, 4, 4);
    });
    this._makeTile('fac_3_active', (g) => {
      g.fillStyle(0x1A1A2E);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x333333);
      g.fillRect(2, 2, 12, 12);
      g.fillStyle(0x00AA00); // Green light
      g.fillRect(6, 6, 4, 4);
    });
    this._makeTile('fac_4', (g) => {
      g.fillStyle(0x6B4226);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x888888);
      g.fillRect(0, 0, 16, 2);
      g.fillRect(0, 14, 16, 2);
      g.fillRect(0, 0, 2, 16);
      g.fillRect(14, 0, 2, 16);
    });
    this._makeTile('fac_5', (g) => {
      g.fillStyle(0x333333);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x0066FF);
      g.fillRect(2, 2, 12, 8);
    });
    this._makeTile('fac_6', (g) => {
      g.fillStyle(0x3A3A3A);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x00FF00);
      g.fillRect(6, 10, 4, 4);
      g.fillRect(7, 6, 2, 4);
    });
    this._makeTile('fac_7', (g) => {
      g.fillStyle(0xFFCC00);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x000000);
      g.fillRect(0, 0, 4, 16);
      g.fillRect(8, 0, 4, 16);
    });
    this._makeTile('fac_8', (g) => {
      g.fillStyle(0x3A3A3A);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x888888);
      g.fillRect(4, 4, 3, 2);
      g.fillStyle(0x8B4513);
      g.fillRect(10, 8, 2, 3);
    });
    this._makeTile('fac_9', (g) => {
      g.fillStyle(0x222222);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x555555);
      g.fillRect(2, 2, 12, 1);
      g.fillRect(2, 6, 12, 1);
      g.fillRect(2, 10, 12, 1);
      g.fillRect(2, 14, 12, 1);
    });
  }

  create() {
    this.gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
    this.prologuePhase = 'intro';

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

    // Spawn Player
    this.player = new Player(this, 10, 12, isSolid);
    this.player.facing = 'up';
    this.player.setTexture('player_up');

    // Camera
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, FACILITY_MAP.width * TILE_SIZE, FACILITY_MAP.height * TILE_SIZE);
    
    // Dim the scene to represent power outage
    this.cameras.main.setAlpha(0.6); 

    this.textBox = new TextBox(this);

    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    GlobalEventBus.on(GameEvents.PLAYER_TILE_ENTERED, (payload) => {
      if (FACILITY_MAP.data[payload.tileY][payload.tileX] === DOORMAT) {
        if (this.gameState.getFlag('prologue_complete')) {
          this.exitToWorld();
        } else {
          this.player.isMoving = true;
          this.textBox.show(["[RADIO] Emergency doors are sealed.", "Restore power first!"], () => {
             this.player.isMoving = false;
             // Force player back a tile (simple bounce back)
             this.player.setGridPosition(this.player.tileX, this.player.tileY - 1);
          });
        }
      }
    }, { holder: this });

    this.events.on('shutdown', () => {
      GlobalEventBus.offHolder(this);
    });

    this.events.on('resume', () => {
      if (this.prologuePhase === 'battle') {
        this.prologuePhase = 'outro';
        this.time.delayedCall(500, () => {
          this.player.isMoving = true;
          this.textBox.show([
            "[RADIO] Good work, technician. Sector 7 secured.",
            "[RADIO] Report back to HQ. Your assignment here is complete.",
            "[RADIO] ...and take those creatures with you. Consider it severance."
          ], () => {
            this.player.isMoving = false;
            this.gameState.setFlag('prologue_complete', true);
            this.gameState.setFlag('received_starter_trio', true);
            
            // Save the game
            const saveService = ServiceLocator.resolve(ServiceKeys.SAVE);
            saveService.saveGame().then(() => {
              this.exitToWorld();
            });
          });
        });
      }
    });

    // Start prologue or skip
    if (this.gameState.getFlag('prologue_complete')) {
       this.cameras.main.setAlpha(1.0);
       // Ensure generator is green if they returned
       this.tileSprites[2][9].setTexture('fac_3_active');
       this.tileSprites[2][10].setTexture('fac_3_active');
    } else {
       this.cameras.main.fadeIn(500, 0, 0, 0);
       this.time.delayedCall(500, () => {
         this.player.isMoving = true;
         this.textBox.show([
            "[RADIO] Emergency Protocol activated.",
            "[RADIO] Containment breach in Sector 7.",
            "[RADIO] Technician, use your Magnemite to reactivate the backup generator.",
            "[RADIO] Then secure any escaped specimens."
         ], () => {
            this.player.isMoving = false;
            this.prologuePhase = 'explore';
         });
       });
    }
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
    // === DEBUG OVERLAY ===
    if (!this.debugText) {
      this.debugText = this.add.text(4, 4, '', {
        fontSize: '8px',
        fontFamily: 'monospace',
        fill: '#00ff00',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 4 }
      });
      this.debugText.setScrollFactor(0);
      this.debugText.setDepth(9999);
    }

    const cursorsExist = !!this.player.cursors;
    const upDown = this.player.cursors ? this.player.cursors.up.isDown : 'N/A';
    const downDown = this.player.cursors ? this.player.cursors.down.isDown : 'N/A';
    const leftDown = this.player.cursors ? this.player.cursors.left.isDown : 'N/A';
    const rightDown = this.player.cursors ? this.player.cursors.right.isDown : 'N/A';
    const wDown = this.player.wasd && this.player.wasd.W ? this.player.wasd.W.isDown : 'N/A';
    const rawInput = this.player.getRawInput();
    const tbVisible = this.textBox ? this.textBox.isVisible() : 'N/A';

    this.debugText.setText([
      `isMoving: ${this.player.isMoving}`,
      `phase: ${this.prologuePhase}`,
      `tile: ${this.player.tileX},${this.player.tileY}`,
      `textBox: ${tbVisible}`,
      `cursors: ${cursorsExist}`,
      `UP:${upDown} DN:${downDown} LT:${leftDown} RT:${rightDown}`,
      `W:${wDown} rawInput:${rawInput}`,
      `kbPlugin: ${!!this.input.keyboard}`,
    ].join('\n'));
    // === END DEBUG ===

    if (this.textBox && this.textBox.isVisible && this.textBox.isVisible()) {
      this.textBox.update(time, delta);
      return;
    }

    this.player.update(time, delta);

    const interactDown = this.interactKey && this.interactKey.isDown;
    const spaceDown = this.spaceKey && this.spaceKey.isDown;

    if ((interactDown && !this.lastInteractDown) || (spaceDown && !this.lastSpaceDown)) {
      this.handleInteraction();
    }

    this.lastInteractDown = interactDown;
    this.lastSpaceDown = spaceDown;
  }

  handleInteraction() {
    const front = this.player.getTileInFront();
    if (front.x < 0 || front.y < 0 || front.x >= FACILITY_MAP.width || front.y >= FACILITY_MAP.height) return;
    
    const tileId = FACILITY_MAP.data[front.y][front.x];

    if (tileId === CONSOLE) {
      this.player.isMoving = true;
      this.textBox.show(["System Status: OFFLINE", "Backup generator required."], () => {
        this.player.isMoving = false;
      });
    } else if (tileId === GENERATOR && this.prologuePhase === 'explore') {
      const hasElectric = this.gameState.getPartyMemberByType('electric');
      
      this.player.isMoving = true;
      if (hasElectric) {
        this.textBox.show([
          "Magnemite releases a pulse of electricity...", 
          "The generator hums back to life!", 
          "Emergency lights activate across the facility."
        ], () => {
          // Reactivate power visually
          this.tileSprites[2][9].setTexture('fac_3_active');
          this.tileSprites[2][10].setTexture('fac_3_active');
          this.cameras.main.setAlpha(1.0);
          
          this.prologuePhase = 'generator_active';
          
          // Trigger forced encounter
          this.time.delayedCall(1000, () => {
            this.textBox.show([
              "Something stirs in the shadows...", 
              "A wild Zubat escaped from containment!"
            ], () => {
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
                this.player.isMoving = false;
              });
            });
          });
        });
      } else {
        this.textBox.show([
          "The generator needs an electric charge to restart.", 
          "You need a Pokemon with electrical abilities."
        ], () => {
          this.player.isMoving = false;
        });
      }
    }
  }
}
