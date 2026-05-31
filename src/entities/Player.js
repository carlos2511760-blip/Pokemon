import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    // Add to scene display and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // Slightly smaller hitbox for better movement through tight spaces
    this.body.setSize(24, 24);
    this.body.setOffset(4, 8);

    // Keyboard input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,S,A,D');

    this.speed = 150;
  }

  update(time, delta) {
    this.body.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    // Horizontal movement
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -this.speed;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = this.speed;
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -this.speed;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = this.speed;
    }

    this.body.setVelocity(velocityX, velocityY);

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    if (velocityX !== 0 || velocityY !== 0) {
      this.body.velocity.normalize().scale(this.speed);
    }
  }
}
