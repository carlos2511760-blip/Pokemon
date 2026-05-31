import Phaser from 'phaser';
import Player from '../entities/Player.js';

export default class IndoorScene extends Phaser.Scene {
  constructor() {
    super('IndoorScene');
  }

  create() {
    // Indoor background (wooden floor color)
    this.cameras.main.setBackgroundColor('#8B5A2B');

    // Create a simple room using graphics
    let walls = this.add.graphics();
    walls.fillStyle(0x000000);
    // Top wall
    walls.fillRect(0, 0, 800, 100);
    // Bottom walls with a gap for the door
    walls.fillRect(0, 500, 350, 100);
    walls.fillRect(450, 500, 350, 100);
    // Left wall
    walls.fillRect(0, 0, 100, 600);
    // Right wall
    walls.fillRect(700, 0, 100, 600);

    // Doorway rug
    let rug = this.add.graphics();
    rug.fillStyle(0xCD5C5C); // Red rug
    rug.fillRect(350, 480, 100, 40);

    // Add physics bodies for the walls
    this.wallGroup = this.physics.add.staticGroup();
    this.wallGroup.create(400, 50, 'wall').setSize(800, 100).setVisible(false);
    this.wallGroup.create(175, 550, 'wall').setSize(350, 100).setVisible(false);
    this.wallGroup.create(625, 550, 'wall').setSize(350, 100).setVisible(false);
    this.wallGroup.create(50, 300, 'wall').setSize(100, 600).setVisible(false);
    this.wallGroup.create(750, 300, 'wall').setSize(100, 600).setVisible(false);

    // Door transition zone
    this.doorZone = this.add.zone(400, 540, 100, 40);
    this.physics.add.existing(this.doorZone, true);

    // Spawn player just inside the door
    this.player = new Player(this, 400, 450);

    // Collisions
    this.physics.add.collider(this.player, this.wallGroup);

    // Transition logic
    this.physics.add.overlap(this.player, this.doorZone, () => {
      // Exit house
      this.cameras.main.fade(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldScene', { spawnX: 300, spawnY: 400 }); // Pass a rough exit coordinate if needed
      });
    });

    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
