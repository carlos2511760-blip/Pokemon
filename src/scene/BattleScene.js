import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.wildPokemon = data.wildPokemon || { name: 'Pidgey', level: 3, hp: 15, maxHp: 15 };
    this.playerPokemon = { name: 'Charmander', level: 5, hp: 20, maxHp: 20 };
  }

  preload() {
    // Load real sprites from PokeAPI
    // 16 is Pidgey, 4 is Charmander
    this.load.image('wild_sprite', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png');
    this.load.image('player_sprite', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png');
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue

    // Grass platforms
    let graphics = this.add.graphics();
    graphics.fillStyle(0x32CD32); // Lime green
    graphics.fillEllipse(600, 200, 250, 80); // Enemy platform
    graphics.fillEllipse(200, 450, 300, 100); // Player platform

    // Enemy Pokemon (PokeAPI Sprite)
    this.enemySprite = this.add.image(600, 160, 'wild_sprite').setScale(2);
    this.add.text(550, 100, `${this.wildPokemon.name} Lv${this.wildPokemon.level}`, { fontSize: '20px', fill: '#000' });
    this.enemyHpText = this.add.text(550, 120, `HP: ${this.wildPokemon.hp}/${this.wildPokemon.maxHp}`, { fontSize: '16px', fill: '#000' });

    // Player Pokemon (PokeAPI Sprite)
    this.playerSprite = this.add.image(200, 380, 'player_sprite').setScale(3);
    this.add.text(150, 320, `${this.playerPokemon.name} Lv${this.playerPokemon.level}`, { fontSize: '20px', fill: '#000' });
    this.playerHpText = this.add.text(150, 340, `HP: ${this.playerPokemon.hp}/${this.playerPokemon.maxHp}`, { fontSize: '16px', fill: '#000' });

    // UI Panel (Bottom)
    let uiPanel = this.add.graphics();
    uiPanel.fillStyle(0xFFFFFF);
    uiPanel.lineStyle(4, 0x000000);
    uiPanel.fillRect(0, 480, 800, 120);
    uiPanel.strokeRect(0, 480, 800, 120);

    // Dialog Text
    this.dialogText = this.add.text(20, 500, `Wild ${this.wildPokemon.name} appeared!`, { fontSize: '24px', fill: '#000' });

    // Action Buttons
    this.attackBtn = this.add.text(500, 500, 'FIGHT', { fontSize: '24px', fill: '#000' }).setInteractive();
    this.runBtn = this.add.text(500, 550, 'RUN', { fontSize: '24px', fill: '#000' }).setInteractive();

    this.attackBtn.on('pointerdown', () => this.handleAttack());
    this.runBtn.on('pointerdown', () => this.handleRun());
    
    // Hover effects
    this.attackBtn.on('pointerover', () => this.attackBtn.setFill('#FF0000'));
    this.attackBtn.on('pointerout', () => this.attackBtn.setFill('#000000'));
    this.runBtn.on('pointerover', () => this.runBtn.setFill('#FF0000'));
    this.runBtn.on('pointerout', () => this.runBtn.setFill('#000000'));

    this.state = 'player_turn';
  }

  handleAttack() {
    if (this.state !== 'player_turn') return;
    this.state = 'animating';

    this.dialogText.setText(`${this.playerPokemon.name} used SCRATCH!`);
    
    // Simple attack animation
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 20,
      y: this.playerSprite.y - 20,
      yoyo: true,
      duration: 100,
      onComplete: () => {
        let damage = Phaser.Math.Between(3, 6);
        this.wildPokemon.hp = Math.max(0, this.wildPokemon.hp - damage);
        this.enemyHpText.setText(`HP: ${this.wildPokemon.hp}/${this.wildPokemon.maxHp}`);

        // Blink enemy
        this.tweens.add({
          targets: this.enemySprite,
          alpha: 0,
          yoyo: true,
          repeat: 3,
          duration: 100,
          onComplete: () => {
            if (this.wildPokemon.hp <= 0) {
              this.dialogText.setText(`${this.wildPokemon.name} fainted! You won!`);
              this.time.delayedCall(2000, () => {
                this.scene.switch('WorldScene');
              });
            } else {
              this.enemyTurn();
            }
          }
        });
      }
    });
  }

  enemyTurn() {
    this.state = 'enemy_turn';
    this.dialogText.setText(`${this.wildPokemon.name} used TACKLE!`);
    
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: this.enemySprite,
        x: this.enemySprite.x - 20,
        y: this.enemySprite.y + 20,
        yoyo: true,
        duration: 100,
        onComplete: () => {
          let damage = Phaser.Math.Between(2, 4);
          this.playerPokemon.hp = Math.max(0, this.playerPokemon.hp - damage);
          this.playerHpText.setText(`HP: ${this.playerPokemon.hp}/${this.playerPokemon.maxHp}`);

          this.tweens.add({
            targets: this.playerSprite,
            alpha: 0,
            yoyo: true,
            repeat: 3,
            duration: 100,
            onComplete: () => {
              if (this.playerPokemon.hp <= 0) {
                this.dialogText.setText(`${this.playerPokemon.name} fainted! You whited out...`);
                this.time.delayedCall(2000, () => {
                  this.scene.switch('WorldScene'); // In a real game, teleport to Pokecenter
                });
              } else {
                this.dialogText.setText(`What will ${this.playerPokemon.name} do?`);
                this.state = 'player_turn';
              }
            }
          });
        }
      });
    });
  }

  handleRun() {
    if (this.state !== 'player_turn') return;
    this.dialogText.setText('Got away safely!');
    this.state = 'animating';
    this.time.delayedCall(1500, () => {
      this.scene.switch('WorldScene');
    });
  }
}
