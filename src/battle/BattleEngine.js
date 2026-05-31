import { GlobalEventBus } from '../core/GlobalEventBus.js';
import { GameEvents } from '../core/GameEvents.js';
import AttackCommand from './commands/AttackCommand.js';

/**
 * BattleEngine.js
 * 
 * The pure logic engine for battles.
 * Unaware of Phaser or any visual representation.
 * Processes turns, calculates speeds/priorities, executes commands,
 * and emits a BattleResolutionReport for the Presenter to display.
 */
export default class BattleEngine {
  constructor(playerPokemon, wildPokemon) {
    this.playerPokemon = playerPokemon;
    this.wildPokemon = wildPokemon;
    
    this.commandQueue = [];
    this.battleOver = false;
    this.result = null; // 'win', 'lose', 'run'
  }

  /**
   * Submits a command for the player.
   * This triggers the enemy AI to select a command, and then resolves the turn.
   * @param {IBattleCommand} playerCmd 
   */
  submitPlayerTurn(playerCmd) {
    if (this.battleOver) return;

    this.commandQueue.push(playerCmd);
    
    // Extremely simple AI: Pick a random move
    const enemyMoves = this.wildPokemon.moves;
    const randomMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
    const enemyCmd = new AttackCommand(this.wildPokemon, this.playerPokemon, randomMove);
    this.commandQueue.push(enemyCmd);

    this._resolveTurn();
  }

  /**
   * Resolves the current turn, sorting commands and executing them sequentially.
   * Generates a report and emits it.
   */
  _resolveTurn() {
    // Sort queue: Priority descending, then Speed descending
    this.commandQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return b.getSpeed() - a.getSpeed();
    });

    const report = { events: [] };

    // Execute commands
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift();
      
      // If battle ended mid-turn (e.g. run or faint), abort remaining commands
      if (this.battleOver) break;

      // If the executing pokemon fainted before its turn, it can't act
      if (!cmd.source || !cmd.source.isAlive()) continue;

      const results = cmd.execute(this);
      report.events.push(...results);

      // Check faints after every command
      this._checkFaints(report);
    }

    // End of turn processing (status effects)
    if (!this.battleOver) {
      const p1Eot = this.playerPokemon.processEndOfTurn();
      if (p1Eot.damage > 0) {
        report.events.push({ type: 'text', text: `${this.playerPokemon.name} is hurt by its ${p1Eot.event}!` });
        report.events.push({ type: 'damage', target: 'player', amount: p1Eot.damage, newHp: this.playerPokemon.currentHp, maxHp: this.playerPokemon.maxHp });
      }
      const p2Eot = this.wildPokemon.processEndOfTurn();
      if (p2Eot.damage > 0) {
        report.events.push({ type: 'text', text: `${this.wildPokemon.name} is hurt by its ${p2Eot.event}!` });
        report.events.push({ type: 'damage', target: 'enemy', amount: p2Eot.damage, newHp: this.wildPokemon.currentHp, maxHp: this.wildPokemon.maxHp });
      }

      this._checkFaints(report);
      
      this.playerPokemon.modifiers.tick();
      this.wildPokemon.modifiers.tick();
    }

    GlobalEventBus.emit(GameEvents.BATTLE_TURN_RESOLVED, report);
  }

  _checkFaints(report) {
    if (this.battleOver) return;

    if (!this.wildPokemon.isAlive()) {
      report.events.push({ type: 'text', text: `Wild ${this.wildPokemon.name} fainted!` });
      report.events.push({ type: 'faint', target: 'enemy' });
      
      // Calculate XP
      const xpGained = Math.floor((this.wildPokemon.species.baseStats.hp * this.wildPokemon.level) / 7);
      report.events.push({ type: 'text', text: `${this.playerPokemon.name} gained ${xpGained} EXP. Points!` });
      
      const leveledUp = this.playerPokemon.gainXp(xpGained);
      if (leveledUp) {
        report.events.push({ type: 'text', text: `${this.playerPokemon.name} grew to Lv. ${this.playerPokemon.level}!` });
        // Can add learnset logic here later
      }

      this.battleOver = true;
      this.result = 'win';
    } 
    else if (!this.playerPokemon.isAlive()) {
      report.events.push({ type: 'text', text: `${this.playerPokemon.name} fainted!` });
      report.events.push({ type: 'faint', target: 'player' });
      report.events.push({ type: 'text', text: `You blacked out...` });
      
      this.battleOver = true;
      this.result = 'lose';
    }
  }
}
