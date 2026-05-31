import Phaser from 'phaser';
import Player from '../entities/Player.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    // Generate simple procedural tiles
    this.generateTileTextures();
  }

  generateTileTextures() {
    const createTile = (key, color) => {
      let g = this.add.graphics();
      g.fillStyle(color);
      g.fillRect(0, 0, 32, 32);
      // Optional: Add simple borders/patterns for aesthetics
      if (key === 'tree') {
        g.fillStyle(0x004400); g.fillCircle(16, 16, 14);
      } else if (key === 'water') {
        g.lineStyle(2, 0x5555FF); g.strokeRect(2, 2, 28, 28);
      } else if (key === 'house') {
        g.fillStyle(0x8B4513); g.fillRect(4, 4, 24, 24); // Brown house
      } else if (key === 'tallgrass') {
        g.fillStyle(0x228B22); g.fillRect(4, 16, 8, 16); g.fillRect(20, 12, 8, 20); // grass blades
      } else if (key === 'door') {
        g.fillStyle(0x000000); g.fillRect(8, 16, 16, 16);
      }
      g.generateTexture(key, 32, 32);
      g.destroy();
    };

    createTile('grass', 0x7CFC00);
    createTile('path', 0xDEB887);
    createTile('tree', 0x228B22);
    createTile('water', 0x1E90FF);
    createTile('house', 0xA0522D);
    createTile('tallgrass', 0x32CD32);
    createTile('door', 0xDEB887); // Background matches path, door drawn over
  }

  create() {
    // 0: Grass, 1: Path, 2: Tree, 3: Water, 4: House, 5: TallGrass, 6: Door
    const mapData = [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,5,5,5,5,5,5,1,1,5,5,5,5,5,5,5,5,5,5,2],
      [2,5,5,5,5,5,5,1,1,5,5,5,5,5,5,5,5,5,5,2],
      [2,5,5,5,5,5,5,1,1,5,5,5,5,5,5,5,5,5,5,2],
      [2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,4,4,4,4,0,1,1,0,4,4,4,4,0,0,0,0,0,2],
      [2,0,4,4,4,4,0,1,1,0,4,4,4,4,0,0,0,0,0,2],
      [2,0,4,6,4,4,0,1,1,0,4,6,4,4,0,0,0,0,0,2],
      [2,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,4,4,4,4,4,4,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,4,4,4,4,4,4,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,4,6,4,4,4,4,0,0,0,2],
      [2,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,2],
      [2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2],
      [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
      [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
    ];

    const tileKeys = ['grass', 'path', 'tree', 'water', 'house', 'tallgrass', 'door'];
    
    this.solidGroup = this.physics.add.staticGroup();
    this.doorGroup = this.physics.add.staticGroup();
    this.grassGroup = this.physics.add.staticGroup();

    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        let tileIndex = mapData[y][x];
        let key = tileKeys[tileIndex];
        
        let img = this.add.image(x * 32 + 16, y * 32 + 16, key);
        
        if (tileIndex === 2 || tileIndex === 3 || tileIndex === 4) { // solid
          this.solidGroup.add(img);
        } else if (tileIndex === 5) { // tall grass
          let grassZone = this.add.zone(x * 32 + 16, y * 32 + 16, 32, 32);
          this.physics.add.existing(grassZone, true);
          this.grassGroup.add(grassZone);
        } else if (tileIndex === 6) { // door
          let doorZone = this.add.zone(x * 32 + 16, y * 32 + 16, 32, 32);
          this.physics.add.existing(doorZone, true);
          this.doorGroup.add(doorZone);
        }
      }
    }

    // Spawn player in front of Hero's house (X=96, Y=288) or center
    this.player = new Player(this, 3 * 32 + 16, 9 * 32 + 16);
    this.player.setDepth(5);

    // Collider with solid tiles
    this.physics.add.collider(this.player, this.solidGroup);

    // Random encounters in grass
    this.physics.add.overlap(this.player, this.grassGroup, () => {
      if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        if (Phaser.Math.Between(0, 1000) < 5) { // 0.5% chance per frame
          this.player.body.setVelocity(0);
          this.cameras.main.flash(500, 255, 255, 255);
          this.time.delayedCall(500, () => {
             this.scene.switch('BattleScene');
          });
        }
      }
    });

    // Door transition
    this.physics.add.overlap(this.player, this.doorGroup, () => {
      if (this.cursors && this.cursors.up.isDown) {
         this.player.body.setVelocity(0);
         this.cameras.main.fade(250, 0, 0, 0);
         this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('IndoorScene');
         });
      }
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 20 * 32, 20 * 32);
    this.cameras.main.setZoom(2);
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
