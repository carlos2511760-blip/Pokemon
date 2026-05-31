import Phaser from 'phaser';
import Player from '../entities/Player.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.load.image('tiles', '/src/assets/tileset.png');
    this.load.tilemapTiledJSON('map', '/src/assets/tileset.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('pokemon_tiles', 'tiles');
    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    // Set collision on tiles based on property (e.g. collides: true)
    layer.setCollisionByProperty({ collides: true });

    // Ensure the map is scaled properly if needed, but our tiles are 32x32 natively
    
    // Spawn the player near the center of the map
    this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);
    this.add.existing(this.player);

    this.physics.add.collider(this.player, layer);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2); // Zoom in to give it that retro GBA feel
  }

  update(time, delta) {
    this.player.update(time, delta);
  }
}
