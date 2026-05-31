import Phaser from 'phaser';
import Player from '../entities/Player.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.load.image('tiles', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/tileset.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });

    if (!map) {
      console.error('Map failed to load!');
      return;
    }

    const tileset = map.addTilesetImage('pokemon_tiles', 'tiles');

    if (!tileset) {
      console.error('Tileset not found! Name in JSON:', map.tilesets);
      return;
    }

    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    if (!layer) {
      console.error('Layer not found! Layers in map:', map.layers);
      return;
    }

    layer.setCollisionByProperty({ collides: true });

    this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);

    this.physics.add.collider(this.player, layer);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
