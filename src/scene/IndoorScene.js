import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import { ServiceLocator, ServiceKeys } from '../core/ServiceLocator.js';

const TILE_SIZE = 16;

// Indoor tile types
const FLOOR     = 0;
const WALL      = 1;
const TABLE     = 2;
const BOOKSHELF = 3;
const DOORMAT   = 4;
const RUG       = 5;
const CHAIR     = 6;
const PLANT     = 7;

const SOLID_INDOOR = new Set([WALL, TABLE, BOOKSHELF, PLANT]);

const ROOM_WIDTH = 10;
const ROOM_HEIGHT = 8;

// Room layouts for different building types
const LAYOUTS = {
  hero_house: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,3,3,0,0,0,0,2,2,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,5,5,5,5,0,0,1],
    [1,0,0,5,5,5,5,0,0,1],
    [1,7,0,0,0,0,0,0,7,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,4,4,1,1,1,1],
  ],
  rival_house: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,2,2,0,0,0,3,3,3,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,5,5,0,0,0,1],
    [1,0,0,0,5,5,0,0,0,1],
    [1,0,7,0,0,0,0,7,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,4,4,1,1,1,1],
  ],
  oak_lab: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,3,3,3,0,0,3,3,3,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,2,0,0,0,0,2,0,1],
    [1,0,2,0,0,0,0,2,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,4,4,1,1,1,1],
  ],
};

export default class IndoorScene extends Phaser.Scene {
  constructor() {
    super('IndoorScene');
  }

  init(data) {
    this.roomType = (data && data.type) ? data.type : 'hero_house';
  }

  preload() {
    this.generateIndoorTextures();
  }

  generateIndoorTextures() {
    if (this.textures.exists('indoor_0')) return;

    // 0 - Wooden floor
    this._makeTile('indoor_0', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Wood grain lines
      g.fillStyle(0xA8845A);
      g.fillRect(0, 3, 16, 1);
      g.fillRect(0, 7, 16, 1);
      g.fillRect(0, 11, 16, 1);
      g.fillRect(0, 15, 16, 1);
    });

    // 1 - Dark wall
    this._makeTile('indoor_1', (g) => {
      g.fillStyle(0x4A4A5A);
      g.fillRect(0, 0, 16, 16);
      // Wall texture
      g.fillStyle(0x555566);
      g.fillRect(0, 0, 16, 2);
      g.fillRect(0, 14, 16, 2);
      g.fillStyle(0x3A3A4A);
      g.fillRect(4, 4, 8, 8);
    });

    // 2 - Table
    this._makeTile('indoor_2', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Table top
      g.fillStyle(0x8B6914);
      g.fillRect(1, 1, 14, 12);
      g.fillStyle(0xA07828);
      g.fillRect(2, 2, 12, 10);
      // Legs
      g.fillStyle(0x6B4914);
      g.fillRect(2, 13, 2, 3);
      g.fillRect(12, 13, 2, 3);
    });

    // 3 - Bookshelf
    this._makeTile('indoor_3', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Shelf frame
      g.fillStyle(0x5C3317);
      g.fillRect(1, 0, 14, 16);
      // Shelves
      g.fillStyle(0x7A4B2A);
      g.fillRect(2, 0, 12, 1);
      g.fillRect(2, 5, 12, 1);
      g.fillRect(2, 10, 12, 1);
      g.fillRect(2, 15, 12, 1);
      // Books (colorful)
      g.fillStyle(0xCC3333);
      g.fillRect(3, 1, 2, 4);
      g.fillStyle(0x3366CC);
      g.fillRect(5, 1, 2, 4);
      g.fillStyle(0x33AA33);
      g.fillRect(7, 1, 3, 4);
      g.fillStyle(0xCCCC33);
      g.fillRect(10, 1, 2, 4);
      // Lower shelf books
      g.fillStyle(0xAA33AA);
      g.fillRect(3, 6, 3, 4);
      g.fillStyle(0x33AAAA);
      g.fillRect(6, 6, 2, 4);
      g.fillStyle(0xCC6633);
      g.fillRect(8, 6, 4, 4);
      // Bottom shelf books
      g.fillStyle(0x336633);
      g.fillRect(3, 11, 4, 4);
      g.fillStyle(0x663333);
      g.fillRect(7, 11, 3, 4);
      g.fillStyle(0x333366);
      g.fillRect(10, 11, 2, 4);
    });

    // 4 - Doormat (exit trigger)
    this._makeTile('indoor_4', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Mat
      g.fillStyle(0xCC6633);
      g.fillRect(2, 3, 12, 10);
      g.fillStyle(0xB85C2A);
      g.fillRect(3, 4, 10, 8);
      // Arrow/direction indicator
      g.fillStyle(0xEEAA44);
      g.fillRect(6, 6, 4, 1);
      g.fillRect(7, 7, 2, 1);
      g.fillRect(6, 8, 4, 1);
      g.fillRect(7, 9, 2, 1);
    });

    // 5 - Rug
    this._makeTile('indoor_5', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Rug base
      g.fillStyle(0x884422);
      g.fillRect(1, 1, 14, 14);
      g.fillStyle(0xAA5533);
      g.fillRect(2, 2, 12, 12);
      // Pattern
      g.fillStyle(0xCC7744);
      g.fillRect(4, 4, 8, 8);
    });

    // 6 - Chair
    this._makeTile('indoor_6', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Chair
      g.fillStyle(0x6B4914);
      g.fillRect(3, 0, 10, 3);
      g.fillRect(4, 3, 8, 8);
      g.fillRect(3, 11, 2, 5);
      g.fillRect(11, 11, 2, 5);
      g.fillStyle(0x884422);
      g.fillRect(5, 4, 6, 6);
    });

    // 7 - Potted plant
    this._makeTile('indoor_7', (g) => {
      g.fillStyle(0xC19A6B);
      g.fillRect(0, 0, 16, 16);
      // Pot
      g.fillStyle(0xCC6633);
      g.fillRect(4, 10, 8, 6);
      g.fillRect(5, 9, 6, 1);
      // Plant leaves
      g.fillStyle(0x228B22);
      g.fillRect(5, 2, 6, 7);
      g.fillRect(3, 4, 10, 4);
      g.fillStyle(0x33AA33);
      g.fillRect(6, 3, 4, 4);
    });
  }

  _makeTile(key, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }

  create() {
    const layout = LAYOUTS[this.roomType] || LAYOUTS['hero_house'];

    this.roomLayout = layout;

    // Render tiles
    for (let y = 0; y < ROOM_HEIGHT; y++) {
      for (let x = 0; x < ROOM_WIDTH; x++) {
        const tileId = layout[y][x];
        const img = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'indoor_' + tileId
        );
        img.setDepth(0);
      }
    }

    // Collision check
    const isSolid = (tileX, tileY) => {
      if (tileX < 0 || tileY < 0 || tileX >= ROOM_WIDTH || tileY >= ROOM_HEIGHT) {
        return true;
      }
      return SOLID_INDOOR.has(layout[tileY][tileX]);
    };

    // Spawn player at doormat position (bottom center)
    this.player = new Player(this, 4, 6, isSolid);
    this.player.facing = 'up';
    this.player.setTexture('player_up');

    // Camera
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, ROOM_WIDTH * TILE_SIZE, ROOM_HEIGHT * TILE_SIZE);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Listen for player steps
    GlobalEventBus.on(GameEvents.PLAYER_TILE_ENTERED, (payload) => {
      this.onPlayerStep(payload.tileX, payload.tileY);
    }, { holder: this });

    this.exitLocked = false;

    // Cleanup
    this.events.on('shutdown', () => {
      GlobalEventBus.offHolder(this);
    });
  }

  onPlayerStep(tileX, tileY) {
    if (this.exitLocked) return;

    const tileId = this.roomLayout[tileY] && this.roomLayout[tileY][tileX];

    if (tileId === DOORMAT) {
      this.exitLocked = true;

      // Calculate where player should spawn in WorldScene
      let targetSpawn = { x: 5, y: 9 };
      if (this.roomType === 'hero_house') targetSpawn = { x: 5, y: 9 };
      if (this.roomType === 'rival_house') targetSpawn = { x: 21, y: 9 };
      if (this.roomType === 'oak_lab') targetSpawn = { x: 16, y: 16 };

      // Update GameState Location
      const gs = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
      gs.location.scene = 'WorldScene';
      gs.location.x = targetSpawn.x;
      gs.location.y = targetSpawn.y;
      gs.location.facing = 'down';

      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldScene', { spawnPoint: targetSpawn });
      });
    }
  }

  update(time, delta) {
    if (!this.exitLocked) {
      this.player.update(time, delta);
    }
  }
}
