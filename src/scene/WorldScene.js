import Phaser from 'phaser';
import { PALLET_TOWN } from '../data/maps.js';
import Player from '../entities/Player.js';
import Pokemon from '../entities/Pokemon.js';
import TextBox from '../ui/TextBox.js';
import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import { ServiceLocator, ServiceKeys } from '../core/ServiceLocator.js';

const TILE_SIZE = 16;

// Tile type constants
const TILE_GRASS      = 0;
const TILE_PATH       = 1;
const TILE_TREE       = 2;
const TILE_WATER      = 3;
const TILE_HOUSE_WALL = 4;
const TILE_TALL_GRASS = 5;
const TILE_DOOR       = 6;
const TILE_ROOF       = 7;
const TILE_FENCE      = 8;
const TILE_FLOWER     = 9;
const TILE_SIGN       = 10;
const TILE_LAB_WALL   = 11;
const TILE_LAB_DOOR   = 12;

// Solid tile types
const SOLID_TILES = new Set([
  TILE_TREE, TILE_WATER, TILE_HOUSE_WALL, TILE_ROOF,
  TILE_FENCE, TILE_SIGN, TILE_LAB_WALL
]);

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.generateTileTextures();
  }

  /**
   * Procedurally generate all 16x16 tile textures
   */
  generateTileTextures() {
    // Only generate if not already done
    if (this.textures.exists('tile_0')) return;

    // 0 - Grass
    this._makeTile('tile_0', (g) => {
      g.fillStyle(0x7CFC00);
      g.fillRect(0, 0, 16, 16);
      // Subtle texture
      g.fillStyle(0x6AE000);
      g.fillRect(3, 4, 1, 1);
      g.fillRect(10, 8, 1, 1);
      g.fillRect(6, 13, 1, 1);
    });

    // 1 - Path/dirt
    this._makeTile('tile_1', (g) => {
      g.fillStyle(0xDEB887);
      g.fillRect(0, 0, 16, 16);
      // Texture specks
      g.fillStyle(0xC8A070);
      g.fillRect(2, 3, 1, 1);
      g.fillRect(8, 7, 1, 1);
      g.fillRect(12, 12, 2, 1);
      g.fillRect(5, 14, 1, 1);
    });

    // 2 - Tree
    this._makeTile('tile_2', (g) => {
      g.fillStyle(0x228B22);
      g.fillRect(0, 0, 16, 16);
      // Trunk
      g.fillStyle(0x8B4513);
      g.fillRect(6, 10, 4, 6);
      // Canopy (dark circle)
      g.fillStyle(0x004400);
      g.fillRect(2, 1, 12, 10);
      g.fillRect(1, 3, 14, 6);
      // Highlight
      g.fillStyle(0x006600);
      g.fillRect(4, 2, 4, 3);
    });

    // 3 - Water
    this._makeTile('tile_3', (g) => {
      g.fillStyle(0x1E90FF);
      g.fillRect(0, 0, 16, 16);
      // Wave lines
      g.fillStyle(0x63B8FF);
      g.fillRect(1, 4, 3, 1);
      g.fillRect(6, 4, 4, 1);
      g.fillRect(12, 4, 3, 1);
      g.fillRect(3, 10, 4, 1);
      g.fillRect(9, 10, 4, 1);
      // Darker areas
      g.fillStyle(0x1874CD);
      g.fillRect(0, 7, 3, 1);
      g.fillRect(8, 13, 5, 1);
    });

    // 4 - House wall
    this._makeTile('tile_4', (g) => {
      g.fillStyle(0xD2B48C);
      g.fillRect(0, 0, 16, 16);
      // Brown border
      g.fillStyle(0x8B7355);
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(0, 0, 1, 16);
      g.fillRect(15, 0, 1, 16);
      // Window
      g.fillStyle(0x87CEEB);
      g.fillRect(5, 4, 6, 5);
      g.fillStyle(0x8B7355);
      g.fillRect(7, 4, 2, 5);
      g.fillRect(5, 6, 6, 1);
    });

    // 5 - Tall grass
    this._makeTile('tile_5', (g) => {
      g.fillStyle(0x32CD32);
      g.fillRect(0, 0, 16, 16);
      // V-shaped grass blades (darker)
      g.fillStyle(0x228B22);
      // Blade 1
      g.fillRect(2, 4, 1, 4);
      g.fillRect(3, 3, 1, 1);
      g.fillRect(4, 4, 1, 4);
      // Blade 2
      g.fillRect(8, 6, 1, 4);
      g.fillRect(9, 5, 1, 1);
      g.fillRect(10, 6, 1, 4);
      // Blade 3
      g.fillRect(5, 10, 1, 4);
      g.fillRect(6, 9, 1, 1);
      g.fillRect(7, 10, 1, 4);
      // Blade 4
      g.fillRect(12, 3, 1, 4);
      g.fillRect(13, 2, 1, 1);
      g.fillRect(14, 3, 1, 4);
    });

    // 6 - Door
    this._makeTile('tile_6', (g) => {
      g.fillStyle(0xD2B48C);
      g.fillRect(0, 0, 16, 16);
      // Dark door opening
      g.fillStyle(0x3E2723);
      g.fillRect(3, 2, 10, 14);
      // Door frame
      g.fillStyle(0x5D4037);
      g.fillRect(3, 2, 1, 14);
      g.fillRect(12, 2, 1, 14);
      g.fillRect(3, 2, 10, 1);
      // Doorknob
      g.fillStyle(0xFFD700);
      g.fillRect(10, 9, 2, 2);
    });

    // 7 - Roof
    this._makeTile('tile_7', (g) => {
      g.fillStyle(0xCC3333);
      g.fillRect(0, 0, 16, 16);
      // Roof tile pattern
      g.fillStyle(0xAA2222);
      for (let row = 0; row < 16; row += 4) {
        g.fillRect(0, row, 16, 1);
      }
      g.fillStyle(0xDD4444);
      g.fillRect(3, 1, 2, 2);
      g.fillRect(9, 1, 2, 2);
      g.fillRect(6, 5, 2, 2);
      g.fillRect(12, 5, 2, 2);
      g.fillRect(3, 9, 2, 2);
      g.fillRect(9, 9, 2, 2);
    });

    // 8 - Fence
    this._makeTile('tile_8', (g) => {
      g.fillStyle(0x7CFC00);
      g.fillRect(0, 0, 16, 16);
      // Fence posts
      g.fillStyle(0x8B4513);
      g.fillRect(1, 3, 3, 10);
      g.fillRect(12, 3, 3, 10);
      // Horizontal rails
      g.fillStyle(0xA0522D);
      g.fillRect(0, 5, 16, 2);
      g.fillRect(0, 10, 16, 2);
      // Post caps
      g.fillStyle(0xDEB887);
      g.fillRect(1, 2, 3, 1);
      g.fillRect(12, 2, 3, 1);
    });

    // 9 - Flower
    this._makeTile('tile_9', (g) => {
      g.fillStyle(0x7CFC00);
      g.fillRect(0, 0, 16, 16);
      // Flower stems
      g.fillStyle(0x228B22);
      g.fillRect(4, 8, 1, 4);
      g.fillRect(10, 6, 1, 5);
      // Red flowers
      g.fillStyle(0xFF4444);
      g.fillRect(3, 6, 3, 3);
      // Yellow flowers
      g.fillStyle(0xFFFF00);
      g.fillRect(9, 4, 3, 3);
      // White dots (flower centers)
      g.fillStyle(0xFFFFFF);
      g.fillRect(4, 7, 1, 1);
      g.fillRect(10, 5, 1, 1);
    });

    // 10 - Sign
    this._makeTile('tile_10', (g) => {
      g.fillStyle(0x7CFC00);
      g.fillRect(0, 0, 16, 16);
      // Post
      g.fillStyle(0x8B4513);
      g.fillRect(7, 8, 2, 8);
      // Sign board
      g.fillStyle(0xA9A9A9);
      g.fillRect(2, 2, 12, 7);
      g.fillStyle(0x808080);
      g.fillRect(2, 2, 12, 1);
      g.fillRect(2, 8, 12, 1);
      g.fillRect(2, 2, 1, 7);
      g.fillRect(13, 2, 1, 7);
      // Text lines
      g.fillStyle(0x333333);
      g.fillRect(4, 4, 8, 1);
      g.fillRect(4, 6, 6, 1);
    });

    // 11 - Lab wall
    this._makeTile('tile_11', (g) => {
      g.fillStyle(0xCCCCCC);
      g.fillRect(0, 0, 16, 16);
      // Border lines
      g.fillStyle(0x999999);
      g.fillRect(0, 0, 16, 1);
      g.fillRect(0, 15, 16, 1);
      g.fillRect(0, 0, 1, 16);
      g.fillRect(15, 0, 1, 16);
      // Window
      g.fillStyle(0xADD8E6);
      g.fillRect(4, 3, 8, 6);
      // Window frame
      g.fillStyle(0x999999);
      g.fillRect(4, 3, 8, 1);
      g.fillRect(4, 8, 8, 1);
      g.fillRect(4, 3, 1, 6);
      g.fillRect(11, 3, 1, 6);
      g.fillRect(7, 3, 2, 6);
    });

    // 12 - Lab door
    this._makeTile('tile_12', (g) => {
      g.fillStyle(0xCCCCCC);
      g.fillRect(0, 0, 16, 16);
      // Glass door
      g.fillStyle(0x87CEEB);
      g.fillRect(2, 1, 12, 15);
      // Door frame
      g.fillStyle(0x999999);
      g.fillRect(2, 1, 1, 15);
      g.fillRect(13, 1, 1, 15);
      g.fillRect(2, 1, 12, 1);
      // Center divider
      g.fillStyle(0x999999);
      g.fillRect(7, 1, 2, 15);
      // Handle
      g.fillStyle(0xFFFFFF);
      g.fillRect(6, 8, 1, 2);
      g.fillRect(9, 8, 1, 2);
    });
  }

  /**
   * Helper to create a 16x16 tile texture
   */
  _makeTile(key, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }

  create(data) {
    // Reset state when returning from battle/indoor
    this.encounterLocked = false;

    const map = PALLET_TOWN;
    this.mapData = map;
    this.mapWidth = map.width;
    this.mapHeight = map.height;

    // Get game state
    const gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
    
    // Store reference to player's Pokemon from GameState
    this.playerPokemon = gameState.playerParty[0];

    // Set location tracker
    gameState.location.scene = 'WorldScene';

    // ---- Render map tiles ----
    this.tileSprites = [];
    for (let y = 0; y < map.height; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < map.width; x++) {
        const tileId = map.data[y][x];
        const img = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'tile_' + tileId
        );
        img.setDepth(0);
        this.tileSprites[y][x] = img;
      }
    }

    // ---- Collision check function ----
    const isSolid = (tileX, tileY) => {
      // Out of bounds = solid
      if (tileX < 0 || tileY < 0 || tileX >= this.mapWidth || tileY >= this.mapHeight) {
        return true;
      }
      const tileId = map.data[tileY][tileX];
      if (SOLID_TILES.has(tileId)) return true;

      // Also block if an NPC is on this tile
      if (this.npcMap && this.npcMap[tileY + ',' + tileX]) return true;

      return false;
    };
    this.isSolid = isSolid;

    // ---- Create Player ----
    let spawnX = map.spawnPoint.x;
    let spawnY = map.spawnPoint.y;
    
    // If coming from another scene and passing spawn data, use it, else use gameState location if it matches
    if (data && data.spawnPoint) {
      spawnX = data.spawnPoint.x;
      spawnY = data.spawnPoint.y;
    } else if (gameState.location.scene === 'WorldScene') {
      spawnX = gameState.location.x;
      spawnY = gameState.location.y;
    }
    
    this.player = new Player(this, spawnX, spawnY, isSolid);
    if (gameState.location.facing) {
      this.player.facing = gameState.location.facing;
      this.player.setTexture('player_' + this.player.facing);
    }

    // ---- Create NPCs ----
    this.npcs = [];
    this.npcMap = {};
    this._generateNPCTexture();
    map.npcs.forEach((npcData) => {
      const npc = this.add.image(
        npcData.x * TILE_SIZE + TILE_SIZE / 2,
        npcData.y * TILE_SIZE + TILE_SIZE,
        'npc_sprite'
      );
      npc.setOrigin(0.5, 1);
      npc.setDepth(npcData.y * TILE_SIZE + TILE_SIZE);
      npc.tileX = npcData.x;
      npc.tileY = npcData.y;
      npc.dialog = npcData.dialog;
      npc.direction = npcData.direction;
      this.npcs.push(npc);
      this.npcMap[npcData.y + ',' + npcData.x] = npc;
    });

    // ---- Camera setup ----
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(
      0, 0,
      this.mapWidth * TILE_SIZE,
      this.mapHeight * TILE_SIZE
    );

    // ---- TextBox for NPC dialog ----
    this.textBox = new TextBox(this);

    // ---- Track last tile for step-based encounter ----
    this.lastTileX = this.player.tileX;
    this.lastTileY = this.player.tileY;

    // ---- Listen for player movement events ----
    // Use GlobalEventBus with holder for auto-cleanup
    GlobalEventBus.on(GameEvents.PLAYER_TILE_ENTERED, (payload) => {
      this.onPlayerSteppedOnTile(payload.tileX, payload.tileY);
      
      // Update persistent location
      const gs = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
      gs.location.x = payload.tileX;
      gs.location.y = payload.tileY;
      gs.location.facing = this.player.facing;
      
    }, { holder: this });

    // ---- Interaction key (Enter / Space) ----
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Handle resume from battle
    this.events.on('resume', () => {
      this.encounterLocked = false;
      // Re-fetch in case it changed
      this.playerPokemon = ServiceLocator.resolve(ServiceKeys.GAME_STATE).playerParty[0];
    });

    // Cleanup GlobalEventBus on shutdown
    this.events.on('shutdown', () => {
      GlobalEventBus.offHolder(this);
    });
  }

  /**
   * Generate a simple NPC sprite (16x24)
   */
  _generateNPCTexture() {
    if (this.textures.exists('npc_sprite')) return;

    const g = this.add.graphics();
    // Hair
    g.fillStyle(0xFFAA00);
    g.fillRect(3, 0, 10, 4);
    // Face
    g.fillStyle(0xFFCC99);
    g.fillRect(4, 4, 8, 5);
    // Eyes
    g.fillStyle(0x111111);
    g.fillRect(5, 6, 2, 1);
    g.fillRect(9, 6, 2, 1);
    // Body (green shirt)
    g.fillStyle(0x22AA22);
    g.fillRect(3, 9, 10, 6);
    // Pants
    g.fillStyle(0x4444AA);
    g.fillRect(4, 15, 4, 5);
    g.fillRect(8, 15, 4, 5);
    // Shoes
    g.fillStyle(0x333333);
    g.fillRect(4, 20, 4, 4);
    g.fillRect(8, 20, 4, 4);

    g.generateTexture('npc_sprite', 16, 24);
    g.destroy();
  }

  update(time, delta) {
    if (this.textBox && this.textBox.isVisible && this.textBox.isVisible()) {
      this.textBox.update(time, delta);
      return; // Stop player and interactions while text is showing
    }

    // Ticking System: Only update NPCs near the player
    const TILE_DISTANCE_TICK = 10; // Only update NPCs within 10 tiles of player

    this.npcs.forEach(npc => {
      const dist = Math.abs(npc.tileX - this.player.tileX) + Math.abs(npc.tileY - this.player.tileY);
      if (dist <= TILE_DISTANCE_TICK) {
        npc.update(time, delta);
      }
    });

    this.player.update(time, delta);

    // Check for NPC interaction on key press
    const interactDown = this.interactKey && this.interactKey.isDown;
    const spaceDown = this.spaceKey && this.spaceKey.isDown;

    if ((interactDown && !this.lastInteractDown) || (spaceDown && !this.lastSpaceDown)) {
      this.checkInteraction();
    }

    this.lastInteractDown = interactDown;
    this.lastSpaceDown = spaceDown;
  }

  /**
   * Called when the player finishes stepping onto a new tile
   */
  onPlayerSteppedOnTile(tileX, tileY) {
    if (this.encounterLocked) return;

    const tileId = this.mapData.data[tileY][tileX];

    // Check for door tiles
    if (tileId === TILE_DOOR || tileId === TILE_LAB_DOOR) {
      const doorData = this.mapData.doors.find(d => d.x === tileX && d.y === tileY);
      if (doorData) {
        this.encounterLocked = true;
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(doorData.target, doorData.data);
        });
        return;
      }
    }

    // Check for tall grass encounters (step-based, 10% chance per new tile)
    if (tileId === TILE_TALL_GRASS) {
      const roll = Math.random();
      if (roll < 0.10) {
        this.encounterLocked = true;
        this.startWildEncounter();
      }
    }
  }

  /**
   * Start a wild Pokemon encounter
   */
  startWildEncounter() {
    // Pick a random wild Pokemon
    const wildOptions = [
      { id: 16, level: Phaser.Math.Between(2, 5) },  // Pidgey
      { id: 19, level: Phaser.Math.Between(2, 4) },  // Rattata
      { id: 25, level: Phaser.Math.Between(3, 5) },  // Pikachu (rare)
    ];

    // Weighted random: Pidgey 45%, Rattata 45%, Pikachu 10%
    const rand = Math.random();
    let chosen;
    if (rand < 0.45) {
      chosen = wildOptions[0]; // Pidgey
    } else if (rand < 0.90) {
      chosen = wildOptions[1]; // Rattata
    } else {
      chosen = wildOptions[2]; // Pikachu
    }

    const wildPokemon = new Pokemon(chosen.id, chosen.level);

    // Flash effect before battle
    this.cameras.main.flash(500, 255, 255, 255);
    this.time.delayedCall(500, () => {
      this.scene.launch('BattleScene', {
        wildPokemon: wildPokemon,
        playerPokemon: this.playerPokemon,
        parentScene: 'WorldScene'
      });
      this.scene.pause();
    });
  }

  /**
   * Check if the player can interact with an NPC or sign in front of them
   */
  checkInteraction() {
    const front = this.player.getTileInFront();
    const key = front.y + ',' + front.x;
    const npc = this.npcMap[key];

    if (npc) {
      // Pause player movement during dialog
      this.player.isMoving = true;
      this.textBox.show(npc.dialog, () => {
        this.player.isMoving = false;
      });
      return;
    }

    // Check for sign interaction
    if (front.x >= 0 && front.y >= 0 &&
        front.x < this.mapWidth && front.y < this.mapHeight) {
      const tileId = this.mapData.data[front.y][front.x];
      if (tileId === TILE_SIGN) {
        this.player.isMoving = true;
        this.textBox.show(['PALLET TOWN', 'Shades of your journey await!'], () => {
          this.player.isMoving = false;
        });
      }
    }
  }
}
