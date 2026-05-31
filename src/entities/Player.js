import Phaser from 'phaser';
import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';

const TILE_SIZE = 16;
const INPUT_BUFFER_MS = 150; // Buffer directional inputs up to 150ms before tween ends

export default class Player extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} tileX - Starting tile X
   * @param {number} tileY - Starting tile Y
   * @param {function} collisionCallback - (tileX, tileY) => boolean, true if solid
   */
  constructor(scene, tileX, tileY, collisionCallback) {
    // Generate textures before calling super
    Player.generateTextures(scene);

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    super(scene, px, py, 'player_down');

    this.scene = scene;
    scene.add.existing(this);

    this.setOrigin(0.5, 1);
    this.y = tileY * TILE_SIZE + TILE_SIZE;

    this.tileX = tileX;
    this.tileY = tileY;
    this.facing = 'down';
    this.isMoving = false;
    this.speed = 150; // ms per tile move
    this.collisionCallback = collisionCallback;

    // Depth sorting: higher Y = rendered on top
    this.setDepth(this.tileY * TILE_SIZE + TILE_SIZE);

    // Input setup
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
    
    // Predictive Input Buffer
    this.inputBuffer = null; // { direction, timestamp }
  }

  /**
   * Generate 4-directional procedural trainer sprites (16x24 pixels)
   */
  static generateTextures(scene) {
    if (scene.textures.exists('player_down')) return;

    const directions = ['down', 'up', 'left', 'right'];
    const w = 16;
    const h = 24;

    directions.forEach((dir) => {
      const g = scene.add.graphics();
      // Colors
      const HAT    = 0xCC0000;
      const HAIR   = 0x332211;
      const SKIN   = 0xFFCC99;
      const SHIRT  = 0x3366CC;
      const PANTS  = 0x222244;
      const SHOE   = 0x333333;
      const WHITE  = 0xFFFFFF;
      const EYE    = 0x111111;

      if (dir === 'down') {
        g.fillStyle(HAT); g.fillRect(3, 0, 10, 5);
        g.fillStyle(HAIR); g.fillRect(3, 5, 10, 2);
        g.fillStyle(SKIN); g.fillRect(4, 7, 8, 5);
        g.fillStyle(WHITE); g.fillRect(5, 8, 2, 2); g.fillRect(9, 8, 2, 2);
        g.fillStyle(EYE); g.fillRect(5, 9, 2, 1); g.fillRect(9, 9, 2, 1);
        g.fillStyle(0xCC6666); g.fillRect(7, 11, 2, 1);
        g.fillStyle(SHIRT); g.fillRect(3, 12, 10, 5);
        g.fillStyle(SKIN); g.fillRect(2, 13, 1, 3); g.fillRect(13, 13, 1, 3);
        g.fillStyle(PANTS); g.fillRect(4, 17, 4, 4); g.fillRect(8, 17, 4, 4);
        g.fillStyle(SHOE); g.fillRect(4, 21, 4, 3); g.fillRect(8, 21, 4, 3);
      } else if (dir === 'up') {
        g.fillStyle(HAT); g.fillRect(3, 0, 10, 5);
        g.fillStyle(HAIR); g.fillRect(3, 5, 10, 4);
        g.fillStyle(SKIN); g.fillRect(5, 9, 6, 3);
        g.fillStyle(SHIRT); g.fillRect(3, 12, 10, 5);
        g.fillStyle(SKIN); g.fillRect(2, 13, 1, 3); g.fillRect(13, 13, 1, 3);
        g.fillStyle(PANTS); g.fillRect(4, 17, 4, 4); g.fillRect(8, 17, 4, 4);
        g.fillStyle(SHOE); g.fillRect(4, 21, 4, 3); g.fillRect(8, 21, 4, 3);
      } else if (dir === 'left') {
        g.fillStyle(HAT); g.fillRect(3, 0, 8, 5); g.fillRect(2, 3, 2, 2);
        g.fillStyle(HAIR); g.fillRect(4, 5, 7, 2);
        g.fillStyle(SKIN); g.fillRect(4, 7, 6, 5);
        g.fillStyle(WHITE); g.fillRect(5, 8, 2, 2);
        g.fillStyle(EYE); g.fillRect(5, 9, 1, 1);
        g.fillStyle(SHIRT); g.fillRect(4, 12, 8, 5);
        g.fillStyle(SKIN); g.fillRect(3, 13, 2, 4);
        g.fillStyle(PANTS); g.fillRect(5, 17, 6, 4);
        g.fillStyle(SHOE); g.fillRect(4, 21, 7, 3);
      } else if (dir === 'right') {
        g.fillStyle(HAT); g.fillRect(5, 0, 8, 5); g.fillRect(12, 3, 2, 2);
        g.fillStyle(HAIR); g.fillRect(5, 5, 7, 2);
        g.fillStyle(SKIN); g.fillRect(6, 7, 6, 5);
        g.fillStyle(WHITE); g.fillRect(9, 8, 2, 2);
        g.fillStyle(EYE); g.fillRect(10, 9, 1, 1);
        g.fillStyle(SHIRT); g.fillRect(4, 12, 8, 5);
        g.fillStyle(SKIN); g.fillRect(11, 13, 2, 4);
        g.fillStyle(PANTS); g.fillRect(5, 17, 6, 4);
        g.fillStyle(SHOE); g.fillRect(5, 21, 7, 3);
      }

      g.generateTexture('player_' + dir, w, h);
      g.destroy();
    });
  }

  /**
   * Called every frame. Reads input and initiates grid movement.
   */
  update(time, delta) {
    const rawInput = this.getRawInput();

    if (this.isMoving) {
      // Input Buffer: if moving and we get an input, queue it for seamless transition
      if (rawInput) {
        this.inputBuffer = { direction: rawInput, timestamp: time };
      }
      return;
    }

    // Try buffered input first, if it's fresh enough
    let directionToMove = null;
    if (this.inputBuffer) {
      if (time - this.inputBuffer.timestamp < INPUT_BUFFER_MS) {
        directionToMove = this.inputBuffer.direction;
      }
      this.inputBuffer = null; // Consume buffer
    }

    // Fallback to current raw input
    if (!directionToMove && rawInput) {
      directionToMove = rawInput;
    }

    if (directionToMove) {
      this.facing = directionToMove;
      this.setTexture('player_' + directionToMove);

      const offset = this._getDirectionOffset(directionToMove);
      const targetX = this.tileX + offset.dx;
      const targetY = this.tileY + offset.dy;

      if (this.canMoveTo(targetX, targetY)) {
        this.moveTo(targetX, targetY);
      }
    }
  }

  /** @returns {string|null} */
  getRawInput() {
    if (this.cursors.up.isDown || this.wasd.W.isDown) return 'up';
    if (this.cursors.down.isDown || this.wasd.S.isDown) return 'down';
    if (this.cursors.left.isDown || this.wasd.A.isDown) return 'left';
    if (this.cursors.right.isDown || this.wasd.D.isDown) return 'right';
    return null;
  }

  _getDirectionOffset(dir) {
    if (dir === 'up') return { dx: 0, dy: -1 };
    if (dir === 'down') return { dx: 0, dy: 1 };
    if (dir === 'left') return { dx: -1, dy: 0 };
    if (dir === 'right') return { dx: 1, dy: 0 };
    return { dx: 0, dy: 0 };
  }

  canMoveTo(tileX, tileY) {
    return !this.collisionCallback(tileX, tileY);
  }

  moveTo(tileX, tileY) {
    this.isMoving = true;

    const targetPx = tileX * TILE_SIZE + TILE_SIZE / 2;
    const targetPy = tileY * TILE_SIZE + TILE_SIZE;

    this.scene.tweens.add({
      targets: this,
      x: targetPx,
      y: targetPy,
      duration: this.speed,
      ease: 'Linear',
      onComplete: () => {
        this.tileX = tileX;
        this.tileY = tileY;
        this.isMoving = false;
        this.setDepth(this.tileY * TILE_SIZE + TILE_SIZE);

        // Emit typed event via Global Event Bus
        GlobalEventBus.emit(GameEvents.PLAYER_TILE_ENTERED, { tileX, tileY });
      }
    });
  }

  setGridPosition(tileX, tileY) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.x = tileX * TILE_SIZE + TILE_SIZE / 2;
    this.y = tileY * TILE_SIZE + TILE_SIZE;
    this.setDepth(this.tileY * TILE_SIZE + TILE_SIZE);
  }

  getTileInFront() {
    const off = this._getDirectionOffset(this.facing);
    return { x: this.tileX + off.dx, y: this.tileY + off.dy };
  }
}
