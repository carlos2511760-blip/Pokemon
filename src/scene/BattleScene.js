import Phaser from 'phaser';
import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import { ServiceLocator, ServiceKeys } from '../core/ServiceLocator.js';
import BattleEngine from '../battle/BattleEngine.js';
import AttackCommand from '../battle/commands/AttackCommand.js';
import RunCommand from '../battle/commands/RunCommand.js';

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.wildPokemon = data.wildPokemon;
    this.parentScene = data.parentScene || 'WorldScene';
    const gameState = ServiceLocator.resolve(ServiceKeys.GAME_STATE);
    this.playerPokemon = gameState.playerParty[0];

    this.engine = new BattleEngine(this.playerPokemon, this.wildPokemon);
  }

  preload() {
    // In a full game, these would map to real IDs or generic sprite sheets
    // We'll just load placeholders if they don't exist
    const pSprite = this.playerPokemon.species.id || 4; // fallback charmander
    const eSprite = this.wildPokemon.species.id || 16;  // fallback pidgey
    
    this.load.image(`sprite_front_${eSprite}`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${eSprite}.png`);
    this.load.image(`sprite_back_${pSprite}`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pSprite}.png`);
  }

  create() {
    // Listen for Engine reports
    GlobalEventBus.on(GameEvents.BATTLE_TURN_RESOLVED, (report) => {
      this.playReport(report);
    }, { holder: this });

    this.events.on('shutdown', () => {
      GlobalEventBus.offHolder(this);
    });

    // --- Visuals ---
    this.cameras.main.setBackgroundColor('#87CEEB');

    let graphics = this.add.graphics();
    graphics.fillStyle(0x32CD32);
    graphics.fillEllipse(600, 200, 250, 80);
    graphics.fillEllipse(200, 450, 300, 100);

    const pSpriteId = this.playerPokemon.species.id || 4;
    const eSpriteId = this.wildPokemon.species.id || 16;

    this.enemySprite = this.add.image(600, 160, `sprite_front_${eSpriteId}`).setScale(2);
    this.add.text(550, 100, `${this.wildPokemon.name} Lv${this.wildPokemon.level}`, { fontSize: '20px', fill: '#000' });
    this.enemyHpText = this.add.text(550, 120, `HP: ${this.wildPokemon.currentHp}/${this.wildPokemon.maxHp}`, { fontSize: '16px', fill: '#000' });

    this.playerSprite = this.add.image(200, 380, `sprite_back_${pSpriteId}`).setScale(3);
    this.add.text(150, 320, `${this.playerPokemon.name} Lv${this.playerPokemon.level}`, { fontSize: '20px', fill: '#000' });
    this.playerHpText = this.add.text(150, 340, `HP: ${this.playerPokemon.currentHp}/${this.playerPokemon.maxHp}`, { fontSize: '16px', fill: '#000' });

    // UI Panel
    let uiPanel = this.add.graphics();
    uiPanel.fillStyle(0xFFFFFF);
    uiPanel.lineStyle(4, 0x000000);
    uiPanel.fillRect(0, 480, 800, 120);
    uiPanel.strokeRect(0, 480, 800, 120);

    this.dialogText = this.add.text(20, 500, `Wild ${this.wildPokemon.name} appeared!`, { fontSize: '24px', fill: '#000' });

    // Interactive UI
    this.attackBtn = this.add.text(500, 500, 'FIGHT', { fontSize: '24px', fill: '#000' }).setInteractive();
    this.runBtn = this.add.text(500, 550, 'RUN', { fontSize: '24px', fill: '#000' }).setInteractive();

    this.attackBtn.on('pointerdown', () => this.handleAttack());
    this.runBtn.on('pointerdown', () => this.handleRun());
    
    this.attackBtn.on('pointerover', () => this.attackBtn.setFill('#FF0000'));
    this.attackBtn.on('pointerout', () => this.attackBtn.setFill('#000000'));
    this.runBtn.on('pointerover', () => this.runBtn.setFill('#FF0000'));
    this.runBtn.on('pointerout', () => this.runBtn.setFill('#000000'));

    this.isAnimating = false;
  }

  handleAttack() {
    if (this.isAnimating || this.engine.battleOver) return;
    this.isAnimating = true;

    // Just pick the first move for now
    const move = this.playerPokemon.moves[0];
    const cmd = new AttackCommand(this.playerPokemon, this.wildPokemon, move);
    this.engine.submitPlayerTurn(cmd);
  }

  handleRun() {
    if (this.isAnimating || this.engine.battleOver) return;
    this.isAnimating = true;

    const cmd = new RunCommand(this.playerPokemon, this.wildPokemon);
    this.engine.submitPlayerTurn(cmd);
  }

  /**
   * Translates Engine logic events into UI animations sequentially.
   */
  async playReport(report) {
    for (const evt of report.events) {
      await this.playEvent(evt);
    }

    if (this.engine.battleOver) {
      await this.sleep(1000);
      this.scene.stop('BattleScene');
      this.scene.resume(this.parentScene);
    } else {
      this.dialogText.setText(`What will ${this.playerPokemon.name} do?`);
      this.isAnimating = false;
    }
  }

  playEvent(evt) {
    return new Promise((resolve) => {
      switch (evt.type) {
        case 'text':
          this.dialogText.setText(evt.text);
          this.time.delayedCall(1000, resolve);
          break;

        case 'animation':
          if (evt.anim === 'attack') {
            const sprite = evt.source === 'player' ? this.playerSprite : this.enemySprite;
            const dx = evt.source === 'player' ? 20 : -20;
            const dy = evt.source === 'player' ? -20 : 20;

            this.tweens.add({
              targets: sprite,
              x: sprite.x + dx,
              y: sprite.y + dy,
              yoyo: true,
              duration: 100,
              onComplete: resolve
            });
          } else {
            resolve();
          }
          break;

        case 'damage':
          const hpText = evt.target === 'player' ? this.playerHpText : this.enemyHpText;
          hpText.setText(`HP: ${evt.newHp}/${evt.maxHp}`);
          
          const targetSprite = evt.target === 'player' ? this.playerSprite : this.enemySprite;
          this.tweens.add({
            targets: targetSprite,
            alpha: 0,
            yoyo: true,
            repeat: 3,
            duration: 100,
            onComplete: resolve
          });
          break;

        case 'faint':
          const fSprite = evt.target === 'player' ? this.playerSprite : this.enemySprite;
          this.tweens.add({
            targets: fSprite,
            y: fSprite.y + 100,
            alpha: 0,
            duration: 500,
            onComplete: resolve
          });
          break;
          
        case 'run_success':
          resolve();
          break;

        default:
          resolve();
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
