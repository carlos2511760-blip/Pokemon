import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Generate simple procedural directional sprites if they don't exist
    if (!scene.textures.exists('trainer_down')) {
      const drawTrainer = (key, dir) => {
        let g = scene.add.graphics();
        // Head
        g.fillStyle(0xffccaa); g.fillRect(4, 4, 8, 8);
        // Hat
        g.fillStyle(0xdd0000); g.fillRect(4, 2, 8, 4);
        if (dir === 'down') g.fillRect(8, 4, 6, 2); // Peak front
        if (dir === 'left') g.fillRect(2, 4, 4, 2); // Peak left
        if (dir === 'right') g.fillRect(10, 4, 4, 2); // Peak right
        // Body
        g.fillStyle(0x0000dd); g.fillRect(3, 12, 10, 8);
        // Legs
        g.fillStyle(0x222222); 
        if (dir === 'up' || dir === 'down') {
          g.fillRect(4, 20, 3, 4); g.fillRect(9, 20, 3, 4);
        } else {
          g.fillRect(6, 20, 4, 4); // Side view legs
        }
        g.generateTexture(key, 16, 24);
        g.destroy();
      };
      drawTrainer('trainer_down', 'down');
      drawTrainer('trainer_up', 'up');
      drawTrainer('trainer_left', 'left');
      drawTrainer('trainer_right', 'right');
    }

    super(scene, x, y, 'trainer_down');

    // Add to scene display and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // Hitbox specifically for the feet of the 16x24 sprite
    this.body.setSize(12, 10);
    this.body.setOffset(2, 14);

    // Keyboard input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,S,A,D');

    this.speed = 120;
    this.facing = 'down';
  }

  update(time, delta) {
    this.body.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;

    // Horizontal movement
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -this.speed;
      this.facing = 'left';
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = this.speed;
      this.facing = 'right';
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -this.speed;
      this.facing = 'up';
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = this.speed;
      this.facing = 'down';
    }

    this.body.setVelocity(velocityX, velocityY);

    // Update texture based on facing
    if (this.facing === 'left') this.setTexture('trainer_left');
    if (this.facing === 'right') this.setTexture('trainer_right');
    if (this.facing === 'up') this.setTexture('trainer_up');
    if (this.facing === 'down') this.setTexture('trainer_down');

    this.body.setVelocity(velocityX, velocityY);

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    if (velocityX !== 0 || velocityY !== 0) {
      this.body.velocity.normalize().scale(this.speed);
    }
  }
}
